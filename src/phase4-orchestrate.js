import logger from './logger.js';
import { getWallets, config, sleep, randomDelay, formatAddress, getBalance } from './utils.js';
import { ContractDeployer } from './phase2-deploy.js';
import { EcosystemInteractor } from './phase3-ecosystem.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MultiAccountOrchestrator {
  constructor() {
    this.wallets = getWallets();
    this.accountStates = {};
    this.stateFile = path.join(__dirname, '../data/orchestrator-state.json');
    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        this.accountStates = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        logger.info(`Loaded state for ${Object.keys(this.accountStates).length} accounts`);
      }
    } catch (e) {
      logger.error('Failed to load orchestrator state:', e);
    }
  }

  saveState() {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.accountStates, null, 2));
    } catch (e) {
      logger.error('Failed to save orchestrator state:', e);
    }
  }

  getAccountState(address) {
    if (!this.accountStates[address]) {
      this.accountStates[address] = {
        lastActivity: 0,
        totalTxs: 0,
        deploymentsCount: 0,
        ecosystemActions: 0,
        phase: 2  // Skip faucet, start at phase 2
      };
    }
    return this.accountStates[address];
  }

  updateAccountState(address, updates) {
    const state = this.getAccountState(address);
    Object.assign(state, updates);
    this.saveState();
  }

  async processAccount(wallet, index) {
    const address = wallet.address;
    const state = this.getAccountState(address);
    
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`Account ${index + 1}/${this.wallets.length}: ${formatAddress(address)}`);
    logger.info(`Phase: ${state.phase} | TXs: ${state.totalTxs} | Deployments: ${state.deploymentsCount}`);
    logger.info(`${'='.repeat(60)}\n`);

    try {
      const balance = await getBalance(wallet);
      logger.info(`Balance: ${balance} zkLTC`);

      if (parseFloat(balance) < 0.001) {
        logger.warn(`⚠️  Low balance! Please claim faucet manually at: https://liteforge.hub.caldera.xyz/`);
        logger.info(`✅ Account ${index + 1} skipped (low balance)\n`);
        return;
      }

      // Phase 2: Contract Deployment
      if (state.phase === 2 && parseFloat(balance) > 0.01) {
        logger.info('📝 Phase 2: Deploying contracts...');
        const deployer = new ContractDeployer(wallet);
        
        try {
          await deployer.deploySimpleContract();
          await randomDelay(5000, 10000);
          
          await deployer.deploySimpleContract();
          await randomDelay(5000, 10000);
          
          this.updateAccountState(address, { 
            deploymentsCount: state.deploymentsCount + 2,
            totalTxs: state.totalTxs + 2,
            phase: 3,
            lastActivity: Date.now()
          });
          
          logger.info('✅ Phase 2 complete');
        } catch (e) {
          logger.error(`Phase 2 error: ${e.message}`);
        }
      }

      // Phase 3: Ecosystem Interaction
      if (state.phase === 3 && parseFloat(balance) > 0.005) {
        logger.info('🌐 Phase 3: Ecosystem interactions...');
        const interactor = new EcosystemInteractor(wallet);
        
        try {
          // DEX swaps
          for (let i = 0; i < config.dexSwaps; i++) {
            await interactor.swapOnDEX(0.0001);
            await randomDelay(10000, 20000);
            this.updateAccountState(address, { 
              totalTxs: state.totalTxs + 1,
              ecosystemActions: state.ecosystemActions + 1
            });
          }
          
          // NFT mints
          for (let i = 0; i < config.nftMints; i++) {
            await interactor.mintNFT();
            await randomDelay(10000, 20000);
            this.updateAccountState(address, { 
              totalTxs: state.totalTxs + 1,
              ecosystemActions: state.ecosystemActions + 1
            });
          }
          
          // Domain registers
          for (let i = 0; i < config.domainRegisters; i++) {
            await interactor.registerDomain();
            await randomDelay(10000, 20000);
            this.updateAccountState(address, { 
              totalTxs: state.totalTxs + 1,
              ecosystemActions: state.ecosystemActions + 1
            });
          }
          
          // DeFi interactions
          for (let i = 0; i < config.defiInteractions; i++) {
            await interactor.interactWithDeFi();
            await randomDelay(10000, 20000);
            this.updateAccountState(address, { 
              totalTxs: state.totalTxs + 1,
              ecosystemActions: state.ecosystemActions + 1
            });
          }
          
          // Game plays
          for (let i = 0; i < config.gamePlays; i++) {
            await interactor.playGame();
            await randomDelay(10000, 20000);
            this.updateAccountState(address, { 
              totalTxs: state.totalTxs + 1,
              ecosystemActions: state.ecosystemActions + 1
            });
          }
          
          this.updateAccountState(address, { 
            phase: 4,
            lastActivity: Date.now()
          });
          
          logger.info('✅ Phase 3 complete');
        } catch (e) {
          logger.error(`Phase 3 error: ${e.message}`);
        }
      }

      // Phase 4: Maintenance (random TXs)
      if (state.phase === 4) {
        logger.info('🔄 Phase 4: Maintenance mode');
        const interactor = new EcosystemInteractor(wallet);
        
        for (let i = 0; i < config.maintenanceActions; i++) {
          try {
            await interactor.randomAction();
            await randomDelay(10000, 20000);
            this.updateAccountState(address, { 
              totalTxs: state.totalTxs + 1,
              lastActivity: Date.now()
            });
          } catch (e) {
            logger.error(`Maintenance action error: ${e.message}`);
          }
        }
        
        logger.info('✅ Maintenance complete');
      }

      logger.info(`✅ Account ${index + 1} processing completed\n`);
      
    } catch (e) {
      logger.error(`Account processing error: ${e.message}`);
    }
  }

  async runOnce() {
    logger.info('🚀 STARTING ORCHESTRATION CYCLE');
    logger.info('█'.repeat(60) + '\n');
    
    for (let i = 0; i < this.wallets.length; i++) {
      await this.processAccount(this.wallets[i], i);
      
      if (i < this.wallets.length - 1) {
        const delay = randomDelay(
          config.accountDelay * 1000,
          config.accountDelay * 1500
        );
        logger.info(`⏳ Waiting ${(delay/1000).toFixed(1)}s before next account...\n`);
        await sleep(delay);
      }
    }
    
    logger.info('\n' + '█'.repeat(60));
    logger.info('✅ ORCHESTRATION CYCLE COMPLETE');
    this.printSummary();
  }

  async start24HourLoop() {
    logger.info('🔄 Starting 24-hour loop mode...\n');
    
    while (true) {
      await this.runOnce();
      
      const nextRun = new Date(Date.now() + 24 * 3600 * 1000);
      logger.info(`\n⏰ Next run: ${nextRun.toLocaleString()}`);
      logger.info('💤 Sleeping for 24 hours...\n');
      
      await sleep(24 * 3600 * 1000);
    }
  }

  printSummary() {
    logger.info('\n📊 ACCOUNT SUMMARY:');
    logger.info('─'.repeat(60));
    
    let totalTxs = 0;
    let totalDeployments = 0;
    let totalEcosystem = 0;
    
    for (const [address, state] of Object.entries(this.accountStates)) {
      logger.info(`${formatAddress(address)}: Phase ${state.phase} | ${state.totalTxs} TXs | ${state.deploymentsCount} deploys`);
      totalTxs += state.totalTxs;
      totalDeployments += state.deploymentsCount;
      totalEcosystem += state.ecosystemActions;
    }
    
    logger.info('─'.repeat(60));
    logger.info(`Total: ${totalTxs} TXs | ${totalDeployments} Deployments | ${totalEcosystem} Ecosystem`);
    logger.info('─'.repeat(60) + '\n');
  }
}
