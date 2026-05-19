import { ethers } from 'ethers';
import logger from './logger.js';
import { config, randomDelay, formatAddress } from './utils.js';

// LitVM Testnet dApps
const DAPPS = {
  // DEX (prioritas tinggi - easy to automate)
  dex: [
    { name: 'LiteSwap', url: 'https://liteswap.app/', router: null },
    { name: 'WolfDex', url: 'https://wolfdex.lovable.app/', router: null },
    { name: 'LitVMSwap', url: 'https://www.litvmswap.com/', router: null },
    { name: 'Drunken Cats', url: 'https://drunkencats.xyz/swap/', router: null },
    { name: 'Addax', url: 'https://www.addax.finance/', router: null },
    { name: 'LitDeX', url: 'https://litdex.test-hub.xyz/', router: null },
    { name: 'LitiumDEX', url: 'https://litiumdex.org/', router: null }
  ],
  
  // NFT (medium priority)
  nft: [
    { name: 'OmniHub', url: 'https://omnihub.xyz/', contract: null },
    { name: 'StampVM', url: 'https://stampvm.xyz/', contract: null },
    { name: 'Mintbrush', url: 'https://mintbrush.xyz/', contract: null },
    { name: 'Sweep', url: 'https://sweep.xyz/', contract: null }
  ],
  
  // Domains (medium priority)
  domains: [
    { name: 'LitNames', url: 'https://litnames.xyz/', contract: null },
    { name: 'ZNS Connect', url: 'https://zns.xyz/', contract: null }
  ],
  
  // DeFi (medium priority)
  defi: [
    { name: 'Ayni', url: 'https://ayni.finance/', contract: null },
    { name: 'Fenus', url: 'https://fenus.xyz/', contract: null }
  ],
  
  // Gaming (low priority - complex)
  gaming: [
    { name: 'LitBillionaire', url: 'https://litlottery.xyz/', contract: null }
  ]
};

// Generic ERC20 ABI
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)'
];

export class EcosystemInteractor {
  constructor(wallet) {
    this.wallet = wallet;
    this.interactions = [];
  }

  // Generic transaction untuk simulate interaction
  async interactWithDApp(dappName, category) {
    logger.info(`🌐 Interacting with ${dappName} (${category})...`);
    
    try {
      // Simple transaction to simulate dApp interaction
      // In production, this would be actual contract calls
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: ethers.parseEther('0.00001'), // Minimal amount
        gasLimit: 100000
      });
      
      logger.info(`⏳ Waiting for transaction...`);
      await tx.wait();
      
      logger.info(`✅ ${dappName} interaction complete: ${tx.hash.slice(0, 10)}...`);
      
      this.interactions.push({
        dapp: dappName,
        category,
        tx: tx.hash,
        timestamp: Date.now()
      });
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ ${dappName} interaction failed: ${e.message}`);
      throw e;
    }
  }

  // DEX interactions (swap simulation)
  async swapOnDEX(amountInETH = 0.0001) {
    const dexList = DAPPS.dex;
    const randomDex = dexList[Math.floor(Math.random() * dexList.length)];
    
    logger.info(`💱 Swapping ${amountInETH} zkLTC on ${randomDex.name}...`);
    
    try {
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: ethers.parseEther(amountInETH.toString()),
        gasLimit: 150000
      });
      
      await tx.wait();
      logger.info(`✅ Swap on ${randomDex.name}: ${tx.hash.slice(0, 10)}...`);
      logger.info(`🔗 ${config.explorerUrl}/tx/${tx.hash}`);
      
      this.interactions.push({
        dapp: randomDex.name,
        category: 'DEX',
        action: 'swap',
        tx: tx.hash,
        timestamp: Date.now()
      });
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ DEX swap failed: ${e.message}`);
      throw e;
    }
  }

  // NFT mint simulation
  async mintNFT() {
    const nftList = DAPPS.nft;
    const randomNFT = nftList[Math.floor(Math.random() * nftList.length)];
    
    logger.info(`🎨 Minting NFT on ${randomNFT.name}...`);
    
    try {
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: 0,
        gasLimit: 200000
      });
      
      await tx.wait();
      logger.info(`✅ NFT minted on ${randomNFT.name}: ${tx.hash.slice(0, 10)}...`);
      logger.info(`🔗 ${config.explorerUrl}/tx/${tx.hash}`);
      
      this.interactions.push({
        dapp: randomNFT.name,
        category: 'NFT',
        action: 'mint',
        tx: tx.hash,
        timestamp: Date.now()
      });
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ NFT mint failed: ${e.message}`);
      throw e;
    }
  }

  // Domain registration simulation
  async registerDomain() {
    const domainList = DAPPS.domains;
    const randomDomain = domainList[Math.floor(Math.random() * domainList.length)];
    
    logger.info(`🌐 Registering domain on ${randomDomain.name}...`);
    
    try {
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: 0,
        gasLimit: 250000
      });
      
      await tx.wait();
      logger.info(`✅ Domain registered on ${randomDomain.name}: ${tx.hash.slice(0, 10)}...`);
      logger.info(`🔗 ${config.explorerUrl}/tx/${tx.hash}`);
      
      this.interactions.push({
        dapp: randomDomain.name,
        category: 'Domain',
        action: 'register',
        tx: tx.hash,
        timestamp: Date.now()
      });
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ Domain registration failed: ${e.message}`);
      throw e;
    }
  }

  // DeFi interaction (lending/borrowing simulation)
  async interactWithDeFi() {
    const defiList = DAPPS.defi;
    const randomDefi = defiList[Math.floor(Math.random() * defiList.length)];
    
    logger.info(`💰 Interacting with ${randomDefi.name} DeFi...`);
    
    try {
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: ethers.parseEther('0.0001'),
        gasLimit: 200000
      });
      
      await tx.wait();
      logger.info(`✅ DeFi interaction on ${randomDefi.name}: ${tx.hash.slice(0, 10)}...`);
      logger.info(`🔗 ${config.explorerUrl}/tx/${tx.hash}`);
      
      this.interactions.push({
        dapp: randomDefi.name,
        category: 'DeFi',
        action: 'interact',
        tx: tx.hash,
        timestamp: Date.now()
      });
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ DeFi interaction failed: ${e.message}`);
      throw e;
    }
  }

  // Gaming interaction
  async playGame() {
    const gameList = DAPPS.gaming;
    const randomGame = gameList[Math.floor(Math.random() * gameList.length)];
    
    logger.info(`🎮 Playing ${randomGame.name}...`);
    
    try {
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: ethers.parseEther('0.0001'),
        gasLimit: 150000
      });
      
      await tx.wait();
      logger.info(`✅ Game interaction on ${randomGame.name}: ${tx.hash.slice(0, 10)}...`);
      logger.info(`🔗 ${config.explorerUrl}/tx/${tx.hash}`);
      
      this.interactions.push({
        dapp: randomGame.name,
        category: 'Gaming',
        action: 'play',
        tx: tx.hash,
        timestamp: Date.now()
      });
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ Game interaction failed: ${e.message}`);
      throw e;
    }
  }

  // Random action dari semua categories
  async randomAction() {
    const actions = [
      () => this.swapOnDEX(0.0001),
      () => this.mintNFT(),
      () => this.registerDomain(),
      () => this.interactWithDeFi(),
      () => this.playGame(),
      () => this.sendRandomTransfer()
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    await action();
  }

  async sendRandomTransfer() {
    logger.info(`💸 Sending random transfer...`);
    
    try {
      const amount = (Math.random() * 0.001 + 0.0001).toFixed(6);
      
      const tx = await this.wallet.sendTransaction({
        to: this.wallet.address,
        value: ethers.parseEther(amount),
        gasLimit: 21000
      });
      
      await tx.wait();
      logger.info(`✅ Transfer: ${amount} zkLTC`);
      
      return tx;
      
    } catch (e) {
      logger.error(`❌ Transfer failed: ${e.message}`);
      throw e;
    }
  }

  // Get interaction summary
  getSummary() {
    const summary = {
      total: this.interactions.length,
      byCategory: {}
    };
    
    this.interactions.forEach(i => {
      if (!summary.byCategory[i.category]) {
        summary.byCategory[i.category] = 0;
      }
      summary.byCategory[i.category]++;
    });
    
    return summary;
  }
}
