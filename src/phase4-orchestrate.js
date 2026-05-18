import logger from './logger.js';
import { getWallets, getProxyForAccount, config, sleep, randomDelay, formatAddress, getBalance } from './utils.js';
import { FaucetClaimer } from './phase1-faucet.js';
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
        lastFaucet: 0,
        lastActivity: 0,
        totalTxs: 0,
        deploymentsCount: 0,
        ecosystemActions: 0,
        phase: 1
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
    const proxy = getProxyForAccount(index);
    
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`Processing Account ${index + 1}/${this.wallets.length}: ${formatAddress(address)}`);
    logger.info(`Phase: ${state.phase} | Total TXs: ${state.totalTxs} | Deployments: ${state.deploymentsCount}`);
    if (proxy) {
      logger.info(`Proxy: ${proxy.split('@')[1] || proxy}`);
    }
    logger.info(`${'='.repeat(60)}\n`);

    try {
      const balance = await getBalance(wallet);
      logger.info(`Current balance: ${balance} zkLTC`);

      // Phase 1: Faucet + Basic TXs
      if (state.phase === 1) {
        const claimer = new FaucetClaimer(wallet, proxy);
        const claimed = await claimer.claim();
        
        if (claimed) {
          this.updateAccountState(address, { 
            lastFaucet: Date.now(),
            lastActivity: Date.now()
          });
          
          await claimer.sendRandomTransactions(5);
          this.updateAccountState(address, { 
            totalTxs: state.totalTxs + 5,
            phase: 2
          });
        }
      }

      // Phase 2: Contract Deployment
      if (state.phase === 2 && parseFloat(balance) > 0.01) {
        const deployer = new ContractDeployer(wallet);
        
        try {
          await deployer.deployToken(`Token${index}`, `TKN${index}`, 1000000);
          await deployer.deployNFT(`NFT${index}`, `NFT${index}`);
          deployer.saveDeployments();
          
          this.updateAccountState(address, {
            deploymentsCount: state.deploymentsCount + 2,
            totalTxs: state.totalTxs + 2,
            lastActivity: Date.now(),
            phase: 3
          });
        } catch (e) {
          logger.error(`Deployment failed for account ${index + 1}: ${e.message}`);
        }
      }

      // Phase 3: Ecosystem Interaction
      if (state.phase === 3 && parseFloat(balance) > 0.005) {
        const interactor = new EcosystemInteractor(wallet);
        
        try {
          if (config.randomizeActions) {
            await interactor.randomInteraction();
            this.updateAccountState(address, {
              ecosystemActions: state.ecosystemActions + 1,
              totalTxs: state.totalTxs + 1,
              lastActivity: Date.now()
            });
          } else {
            await interactor.fullTour();
            this.updateAccountState(address, {
              ecosystemActions: state.ecosystemActions + 4,
              totalTxs: state.totalTxs + 4,
              lastActivity: Date.now(),
              phase: 4
            });
          }
        } catch (e) {
          logger.error(`Ecosystem interaction failed for account ${index + 1}: ${e.message}`);
        }
      }

      // Phase 4: Maintenance (keep active)
      if (state.phase === 4) {
        const hoursSinceActivity = (Date.now() - state.lastActivity) / 3600000;
        
        if (hoursSinceActivity > 24 && parseFloat(balance) > 0.001) {
          logger.info('Performing maintenance activity...');
          const interactor = new EcosystemInteractor(wallet);
          await interactor.randomInteraction();
          
          this.updateAccountState(address, {
            totalTxs: state.totalTxs + 1,
            lastActivity: Date.now()
          });
        } else {
          logger.info('Account is active, skipping maintenance');
        }
      }

      logger.info(`✅ Account ${index + 1} processing completed\n`);
      
    } catch (e) {
      logger.error(`Error processing account ${index + 1}: ${e.message}`);
    }
  }

  async runCycle() {
    logger.info('\n' + '█'.repeat(60));
    logger.info('🚀 STARTING ORCHESTRATION CYCLE');
    logger.info('█'.repeat(60) + '\n');
    
    const startTime = Date.now();

    for (let i = 0; i < this.wallets.length; i++) {
      await this.processAccount(this.wallets[i], i);
      
      // Delay between accounts (except last one)
      if (i < this.wallets.length - 1) {
        const delay = config.accountDelay + (Math.random() * 10000); // Add random jitter
        logger.info(`⏳ Waiting ${(delay / 1000).toFixed(1)}s before next account...\n`);
        await sleep(delay);
      }
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    logger.info('\n' + '█'.repeat(60));
    logger.info(`✅ ORCHESTRATION CYCLE COMPLETED (${duration} minutes)`);
    logger.info('█'.repeat(60) + '\n');
    
    this.printSummary();
  }

  printSummary() {
    logger.info('\n📊 ACCOUNT SUMMARY:');
    logger.info('─'.repeat(60));
    
    this.wallets.forEach((wallet, i) => {
      const state = this.getAccountState(wallet.address);
      logger.info(`Account ${i + 1}: ${formatAddress(wallet.address)}`);
      logger.info(`  Phase: ${state.phase} | TXs: ${state.totalTxs} | Deployments: ${state.deploymentsCount} | Ecosystem: ${state.ecosystemActions}`);
    });
    
    logger.info('─'.repeat(60) + '\n');
  }

  async runOnce() {
    await this.runCycle();
  }

  async start24HourLoop() {
    if (!config.multiAccountEnabled) {
      logger.error('Multi-account mode disabled in config');
      return;
    }

    logger.info('🤖 Starting 24/7 orchestration loop...');
    logger.info(`Accounts: ${this.wallets.length}`);
    logger.info(`Interval: Once per day (24 hours)`);
    logger.info(`Randomize: ${config.randomizeActions}`);
    
    while (true) {
      try {
        await this.runCycle();
        
        // Sleep 24 hours
        const sleepHours = 24;
        logger.info(`\n💤 Sleeping for ${sleepHours} hours (next cycle tomorrow)...`);
        logger.info(`Next run: ${new Date(Date.now() + sleepHours * 3600000).toLocaleString('id-ID', { timeZone: 'Asia/Jayapura' })} WIT\n`);
        
        await sleep(sleepHours * 3600000);
        
      } catch (e) {
        logger.error(`Cycle error: ${e.message}`);
        logger.info('Retrying in 10 minutes...');
        await sleep(600000);
      }
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const orchestrator = new MultiAccountOrchestrator();
    
    const mode = process.argv[2] || 'once';
    
    if (mode === 'loop') {
      await orchestrator.start24HourLoop();
    } else {
      await orchestrator.runOnce();
      process.exit(0);
    }
  })();
}
