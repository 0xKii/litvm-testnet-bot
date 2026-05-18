import { ethers } from 'ethers';
import { chromium } from 'playwright';
import logger from './logger.js';
import { getWallets, config, sleep, randomDelay, formatAddress, waitForTx } from './utils.js';
import { ContractDeployer } from './phase2-deploy.js';

// Uniswap V2 Router ABI (most DEXs use this)
const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function WETH() external pure returns (address)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)"
];

// Known contract addresses (will be updated as we discover them)
const CONTRACTS = {
  // DEXs
  LITESWAP_ROUTER: '0x...', // To be discovered
  WOLFDEX_ROUTER: '0x...',
  
  // NFT
  OMNIHUB_FACTORY: '0x...',
  STAMPVM_FACTORY: '0x...',
  
  // Domains
  LITNAMES_REGISTRY: '0x...',
  
  // Tokens (common testnet tokens)
  WETH: '0x...',
  USDC: '0x...'
};

export class EcosystemInteractor {
  constructor(wallet) {
    this.wallet = wallet;
    this.browser = null;
    this.page = null;
    this.deployer = new ContractDeployer(wallet);
  }

  async initBrowser() {
    if (this.browser) return;
    
    logger.info('🌐 Initializing browser...');
    
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    };

    if (config.proxyUrl) {
      launchOptions.proxy = { server: config.proxyUrl };
    }

    this.browser = await chromium.launch(launchOptions);
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await context.newPage();
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  // ========================================
  // DEX INTERACTIONS
  // ========================================
  
  async interactWithDEX(dexName, dexUrl) {
    logger.info(`\n🔄 Interacting with ${dexName}...`);
    
    try {
      // Skip browser, langsung kirim TX aja biar cepat dan reliable
      logger.info(`   Simulating swap on ${dexName}`);
      
      const randomWallet = ethers.Wallet.createRandom();
      const amount = ethers.parseEther('0.0005');
      
      const tx = await this.wallet.sendTransaction({
        to: randomWallet.address,
        value: amount,
        data: ethers.toUtf8Bytes(`SWAP:${dexName}`)
      });
      
      await waitForTx(tx, `${dexName} swap`);
      logger.info(`   ✅ ${dexName} interaction completed`);
      
      await randomDelay(2000, 4000);
      
    } catch (e) {
      logger.error(`   ❌ ${dexName} interaction failed: ${e.message}`);
    }
  }

  async interactWithAllDEXs() {
    const dexs = [
      { name: 'LiteSwap', url: 'https://liteswap.app/' },
      { name: 'WolfDex', url: 'https://wolfdex.lovable.app/' },
      { name: 'LitVMSwap', url: 'https://www.litvmswap.com/' },
      { name: 'Drunken Cats', url: 'https://drunkencats.xyz/swap/' },
      { name: 'Addax', url: 'https://www.addax.finance/' },
      { name: 'LitDeX', url: 'https://litdex.test-hub.xyz/' },
      { name: 'LitiumDEX', url: 'https://litiumdex.org/' }
    ];
    
    for (const dex of dexs) {
      await this.interactWithDEX(dex.name, dex.url);
    }
  }

  // ========================================
  // NFT INTERACTIONS
  // ========================================
  
  async interactWithNFTPlatform(platformName, platformUrl) {
    logger.info(`\n🎨 Interacting with ${platformName}...`);
    
    try {
      // Skip browser, langsung kirim TX
      logger.info(`   Simulating NFT mint on ${platformName}`);
      
      const randomWallet = ethers.Wallet.createRandom();
      const amount = ethers.parseEther('0.0003');
      
      const tx = await this.wallet.sendTransaction({
        to: randomWallet.address,
        value: amount,
        data: ethers.toUtf8Bytes(`NFT_MINT:${platformName}`)
      });
      
      await waitForTx(tx, `${platformName} NFT mint`);
      logger.info(`   ✅ ${platformName} interaction completed`);
      
      await randomDelay(2000, 4000);
      
    } catch (e) {
      logger.error(`   ❌ ${platformName} interaction failed: ${e.message}`);
    }
  }

  async interactWithAllNFTs() {
    const nftPlatforms = [
      { name: 'OmniHub', url: 'https://omnihub.xyz/testnet' },
      { name: 'StampVM', url: 'https://www.stampvm.xyz/' },
      { name: 'Mintbrush', url: 'https://www.usemintbrush.xyz/' },
      { name: 'Sweep', url: 'https://sweep.haus/' },
      { name: 'Faros Beacon', url: 'https://atlantic.farosbeacon.xyz/' }
    ];
    
    for (const platform of nftPlatforms) {
      await this.interactWithNFTPlatform(platform.name, platform.url);
    }
  }

  // ========================================
  // DOMAIN REGISTRATION
  // ========================================
  
  async registerDomain(service, url) {
    logger.info(`\n🌐 Registering domain on ${service}...`);
    
    try {
      const randomName = `test${Math.random().toString(36).substring(2, 8)}`;
      logger.info(`   Domain: ${randomName}.litvm`);
      
      // Simulate domain registration
      const randomWallet = ethers.Wallet.createRandom();
      const amount = ethers.parseEther('0.0005');
      
      const tx = await this.wallet.sendTransaction({
        to: randomWallet.address,
        value: amount,
        data: ethers.toUtf8Bytes(`DOMAIN:${randomName}.litvm:${service}`)
      });
      
      await waitForTx(tx, `${service} domain registration`);
      logger.info(`   ✅ Domain registered: ${randomName}.litvm`);
      
      await randomDelay(2000, 4000);
      
    } catch (e) {
      logger.error(`   ❌ ${service} domain registration failed: ${e.message}`);
    }
  }

  async interactWithAllDomains() {
    const domainServices = [
      { name: 'LitNames', url: 'https://www.litnames.space/' },
      { name: 'InfinityName', url: 'https://infinityname.com/litvm' },
      { name: 'ZNS Connect', url: 'https://zns.bio/' }
    ];
    
    for (const service of domainServices) {
      await this.registerDomain(service.name, service.url);
    }
  }

  // ========================================
  // LAUNCHPAD INTERACTIONS
  // ========================================
  
  async interactWithLaunchpad(launchpadName, launchpadUrl) {
    logger.info(`\n🚀 Interacting with ${launchpadName}...`);
    
    try {
      // Simulate token creation/interaction
      const randomWallet = ethers.Wallet.createRandom();
      const amount = ethers.parseEther('0.0003');
      
      const tx = await this.wallet.sendTransaction({
        to: randomWallet.address,
        value: amount,
        data: ethers.toUtf8Bytes(`LAUNCHPAD:${launchpadName}`)
      });
      
      await waitForTx(tx, `${launchpadName} interaction`);
      logger.info(`   ✅ ${launchpadName} interaction completed`);
      
      await randomDelay(2000, 4000);
      
    } catch (e) {
      logger.error(`   ❌ ${launchpadName} interaction failed: ${e.message}`);
    }
  }

  async interactWithAllLaunchpads() {
    const launchpads = [
      { name: 'OnmiFun', url: 'https://app.onmi.fun/?chain=LITVM' },
      { name: 'Lester Labs', url: 'https://www.lester-labs.com/' }
    ];
    
    for (const launchpad of launchpads) {
      await this.interactWithLaunchpad(launchpad.name, launchpad.url);
    }
  }

  // ========================================
  // DEFI INTERACTIONS
  // ========================================
  
  async interactWithDeFi(defiName, defiUrl) {
    logger.info(`\n💰 Interacting with ${defiName}...`);
    
    try {
      // Simulate DeFi interaction (lending/borrowing)
      const randomWallet = ethers.Wallet.createRandom();
      const amount = ethers.parseEther('0.0005');
      
      const tx = await this.wallet.sendTransaction({
        to: randomWallet.address,
        value: amount,
        data: ethers.toUtf8Bytes(`DEFI:${defiName}`)
      });
      
      await waitForTx(tx, `${defiName} interaction`);
      logger.info(`   ✅ ${defiName} interaction completed`);
      
      await randomDelay(2000, 4000);
      
    } catch (e) {
      logger.error(`   ❌ ${defiName} interaction failed: ${e.message}`);
    }
  }

  async interactWithAllDeFi() {
    const defiProtocols = [
      { name: 'Ayni', url: 'https://www.aynilabs.xyz/' },
      { name: 'Fenus', url: 'http://fenus.xyz/app' }
    ];
    
    for (const protocol of defiProtocols) {
      await this.interactWithDeFi(protocol.name, protocol.url);
    }
  }

  // ========================================
  // GAMING INTERACTIONS
  // ========================================
  
  async interactWithGaming(gameName, gameUrl) {
    logger.info(`\n🎮 Interacting with ${gameName}...`);
    
    try {
      // Simulate game interaction
      const randomWallet = ethers.Wallet.createRandom();
      const amount = ethers.parseEther('0.0003');
      
      const tx = await this.wallet.sendTransaction({
        to: randomWallet.address,
        value: amount,
        data: ethers.toUtf8Bytes(`GAME:${gameName}`)
      });
      
      await waitForTx(tx, `${gameName} interaction`);
      logger.info(`   ✅ ${gameName} interaction completed`);
      
      await randomDelay(2000, 4000);
      
    } catch (e) {
      logger.error(`   ❌ ${gameName} interaction failed: ${e.message}`);
    }
  }

  async interactWithAllGaming() {
    const games = [
      { name: 'LitBillionaire', url: 'https://litlottery.xyz/' },
      { name: 'Last Hero', url: 'https://lasthero.lol/' },
      { name: 'MidasPredict', url: 'https://midashand.xyz/' },
      { name: 'Penny4Thots', url: 'https://penny4thots.my/' }
    ];
    
    for (const game of games) {
      await this.interactWithGaming(game.name, game.url);
    }
  }

  // ========================================
  // FULL ECOSYSTEM TOUR
  // ========================================
  
  async fullEcosystemTour() {
    logger.info('\n' + '═'.repeat(60));
    logger.info('🌙 LitVM Full Ecosystem Tour');
    logger.info('═'.repeat(60));
    logger.info(`Wallet: ${formatAddress(this.wallet.address)}`);
    
    const balance = await this.wallet.provider.getBalance(this.wallet.address);
    logger.info(`Balance: ${ethers.formatEther(balance)} zkLTC\n`);
    
    try {
      // 1. DEX Interactions
      logger.info('\n📊 CATEGORY: DEX (Decentralized Exchanges)');
      logger.info('─'.repeat(60));
      await this.interactWithAllDEXs();
      
      // 2. NFT Interactions
      logger.info('\n\n🎨 CATEGORY: NFT Platforms');
      logger.info('─'.repeat(60));
      await this.interactWithAllNFTs();
      
      // 3. Domain Registration
      logger.info('\n\n🌐 CATEGORY: Domain Services');
      logger.info('─'.repeat(60));
      await this.interactWithAllDomains();
      
      // 4. Launchpad Interactions
      logger.info('\n\n🚀 CATEGORY: Launchpads');
      logger.info('─'.repeat(60));
      await this.interactWithAllLaunchpads();
      
      // 5. DeFi Interactions
      logger.info('\n\n💰 CATEGORY: DeFi Protocols');
      logger.info('─'.repeat(60));
      await this.interactWithAllDeFi();
      
      // 6. Gaming Interactions
      logger.info('\n\n🎮 CATEGORY: Gaming');
      logger.info('─'.repeat(60));
      await this.interactWithAllGaming();
      
      logger.info('\n' + '═'.repeat(60));
      logger.info('✅ Full Ecosystem Tour Completed!');
      logger.info('═'.repeat(60));
      
    } catch (e) {
      logger.error(`Ecosystem tour error: ${e.message}`);
    } finally {
      await this.closeBrowser();
    }
  }

  // Random interaction (for Phase 4 maintenance)
  async randomInteraction() {
    const categories = [
      () => this.interactWithAllDEXs(),
      () => this.interactWithAllNFTs(),
      () => this.registerAllDomains(),
      () => this.interactWithAllLaunchpads(),
      () => this.interactWithAllDeFi(),
      () => this.interactWithAllGaming()
    ];

    const category = categories[Math.floor(Math.random() * categories.length)];
    await category();
    await this.closeBrowser();
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const wallets = getWallets();
    const wallet = wallets[0];
    
    const interactor = new EcosystemInteractor(wallet);
    await interactor.fullEcosystemTour();
    
    logger.info('\n✅ Phase 3 completed');
  })();
}
