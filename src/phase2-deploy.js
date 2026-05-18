import { ethers } from 'ethers';
import logger from './logger.js';
import { getWallets, waitForTx, formatAddress, randomDelay } from './utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ContractDeployer {
  constructor(wallet) {
    this.wallet = wallet;
    this.deployedContracts = [];
  }

  async deploySimpleContract() {
    logger.info('🚀 Deploying simple storage contract...');
    
    try {
      const abi = ["constructor()"];
      const bytecode = "0x6080604052348015600e575f80fd5b50603e80601a5f395ff3fe60806040525f80fdfea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c63430008140033";
      
      const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
      const contract = await factory.deploy();
      
      logger.info('⏳ Waiting for deployment...');
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      logger.info(`✅ Contract deployed at: ${address}`);
      logger.info(`🔗 Explorer: https://liteforge.explorer.caldera.xyz/address/${address}`);
      
      this.deployedContracts.push({
        type: 'SimpleContract',
        address,
        timestamp: Date.now()
      });
      
      await randomDelay(3000, 6000);
      return { contract, address };
      
    } catch (e) {
      logger.error(`❌ Deployment failed: ${e.message}`);
      throw e;
    }
  }

  async sendMultipleTransactions(count = 5) {
    logger.info(`\n💸 Sending ${count} random transactions...`);
    
    const provider = this.wallet.provider;
    const balance = await provider.getBalance(this.wallet.address);
    
    if (balance === 0n) {
      logger.error('❌ No balance for transactions');
      return;
    }

    const txAmount = balance / BigInt(count * 20); // Use 5% of balance per TX
    
    for (let i = 0; i < count; i++) {
      try {
        const randomWallet = ethers.Wallet.createRandom();
        
        logger.info(`\n📤 TX ${i + 1}/${count}:`);
        logger.info(`   Amount: ${ethers.formatEther(txAmount)} zkLTC`);
        logger.info(`   To: ${formatAddress(randomWallet.address)}`);
        
        const tx = await this.wallet.sendTransaction({
          to: randomWallet.address,
          value: txAmount
        });
        
        logger.info(`   Hash: ${tx.hash}`);
        await tx.wait();
        logger.info(`   ✅ Confirmed!`);
        
        await randomDelay(3000, 8000);
        
      } catch (e) {
        logger.error(`   ❌ TX ${i + 1} failed: ${e.message}`);
      }
    }
    
    logger.info('\n✅ All transactions completed');
  }

  saveDeployments() {
    const file = path.join(__dirname, '../data/deployments.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(this.deployedContracts, null, 2));
    logger.info(`💾 Saved ${this.deployedContracts.length} deployments to data/deployments.json`);
  }

  loadDeployments() {
    const file = path.join(__dirname, '../data/deployments.json');
    if (fs.existsSync(file)) {
      this.deployedContracts = JSON.parse(fs.readFileSync(file, 'utf8'));
      logger.info(`📂 Loaded ${this.deployedContracts.length} previous deployments`);
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const wallets = getWallets();
    const wallet = wallets[0];
    
    logger.info('═'.repeat(60));
    logger.info('🌙 LitVM Phase 2: Contract Deployment & Transactions');
    logger.info('═'.repeat(60));
    logger.info(`Wallet: ${formatAddress(wallet.address)}`);
    
    const balance = await wallet.provider.getBalance(wallet.address);
    logger.info(`Balance: ${ethers.formatEther(balance)} zkLTC\n`);
    
    const deployer = new ContractDeployer(wallet);
    deployer.loadDeployments();
    
    // Deploy contract
    await deployer.deploySimpleContract();
    
    // Send transactions
    await deployer.sendMultipleTransactions(5);
    
    deployer.saveDeployments();
    
    logger.info('\n' + '═'.repeat(60));
    logger.info('✅ Phase 2 completed successfully!');
    logger.info('═'.repeat(60));
  })();
}
