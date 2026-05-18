import { chromium } from 'playwright';
import Captcha from '2captcha';
import logger from './logger.js';
import { config, sleep, randomDelay, formatAddress, getBalance } from './utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const solver = config.captchaKey ? new Captcha.Solver(config.captchaKey) : null;

export class FaucetClaimer {
  constructor(wallet) {
    this.wallet = wallet;
    this.browser = null;
    this.page = null;
    this.stateFile = path.join(__dirname, '../data/faucet-state.json');
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
      }
    } catch (e) {
      logger.error('Failed to load state:', e);
    }
    return {};
  }

  saveState(state) {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    } catch (e) {
      logger.error('Failed to save state:', e);
    }
  }

  async init() {
    logger.info(`Initializing browser for ${formatAddress(this.wallet.address)}`);
    
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    };

    if (config.proxyUrl) {
      launchOptions.proxy = { server: config.proxyUrl };
    }

    this.browser = await chromium.launch(launchOptions);
    
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });

    this.page = await context.newPage();
    
    // Anti-detection
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });
  }

  async solveTurnstile() {
    logger.info('Detecting Turnstile challenge...');
    
    try {
      const turnstileFrame = await this.page.frameLocator('iframe[src*="challenges.cloudflare.com"]');
      const checkbox = turnstileFrame.locator('input[type="checkbox"]');
      
      if (await checkbox.isVisible({ timeout: 5000 })) {
        logger.info('Turnstile checkbox found, attempting click...');
        await checkbox.click();
        await sleep(3000);
        
        // Check if solved automatically
        const verified = await this.page.locator('[data-cf-turnstile-verified="true"]').count();
        if (verified > 0) {
          logger.info('✅ Turnstile solved automatically');
          return true;
        }
      }
    } catch (e) {
      logger.debug('No simple Turnstile checkbox found');
    }

    // Fallback to 2captcha
    if (!solver) {
      logger.error('Turnstile requires solving but no CAPTCHA_API_KEY configured');
      return false;
    }

    logger.info('Using 2captcha to solve Turnstile...');
    
    try {
      const sitekey = await this.page.evaluate(() => {
        const turnstile = document.querySelector('[data-sitekey]');
        return turnstile?.getAttribute('data-sitekey');
      });

      if (!sitekey) {
        logger.error('Could not find Turnstile sitekey');
        return false;
      }

      logger.info(`Sitekey: ${sitekey}`);
      
      const result = await solver.cloudflareTurnstile({
        pageurl: config.faucetUrl,
        sitekey: sitekey
      });

      logger.info('2captcha solved, injecting token...');
      
      await this.page.evaluate((token) => {
        const input = document.querySelector('[name="cf-turnstile-response"]');
        if (input) input.value = token;
      }, result.data);

      await sleep(2000);
      return true;
      
    } catch (e) {
      logger.error('Failed to solve Turnstile:', e.message);
      return false;
    }
  }

  async claim() {
    const state = this.loadState();
    const lastClaim = state[this.wallet.address];
    
    if (lastClaim) {
      const timeSince = Date.now() - lastClaim;
      if (timeSince < config.faucetInterval) {
        const hoursLeft = ((config.faucetInterval - timeSince) / 3600000).toFixed(1);
        logger.info(`⏳ Faucet cooldown: ${hoursLeft}h remaining for ${formatAddress(this.wallet.address)}`);
        return false;
      }
    }

    try {
      await this.init();
      
      const balanceBefore = await getBalance(this.wallet);
      logger.info(`Balance before: ${balanceBefore} zkLTC`);

      logger.info(`Navigating to faucet: ${config.faucetUrl}`);
      await this.page.goto(config.faucetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      await randomDelay(2000, 4000);

      // Connect wallet
      logger.info('Looking for wallet connect button...');
      const connectButton = this.page.locator('button:has-text("Connect"), button:has-text("connect")').first();
      
      if (await connectButton.isVisible({ timeout: 10000 })) {
        await connectButton.click();
        await sleep(2000);
        
        // Select MetaMask or injected wallet
        const metamaskOption = this.page.locator('button:has-text("MetaMask"), button:has-text("Browser Wallet")').first();
        if (await metamaskOption.isVisible({ timeout: 5000 })) {
          await metamaskOption.click();
          await sleep(2000);
        }
      }

      // Manual wallet address input (if no wallet extension)
      const addressInput = this.page.locator('input[placeholder*="address"], input[type="text"]').first();
      if (await addressInput.isVisible({ timeout: 5000 })) {
        logger.info('Entering wallet address manually...');
        await addressInput.fill(this.wallet.address);
        await sleep(1000);
      }

      // Solve Turnstile if present
      await this.solveTurnstile();

      // Click faucet request button
      logger.info('Looking for faucet request button...');
      const requestButton = this.page.locator('button:has-text("Request"), button:has-text("Claim"), button:has-text("Get")').first();
      
      if (await requestButton.isVisible({ timeout: 10000 })) {
        logger.info('Clicking request button...');
        await requestButton.click();
        
        // Wait for success message
        await this.page.waitForSelector('text=/success|claimed|sent/i', { timeout: 30000 });
        
        logger.info('✅ Faucet claim successful!');
        
        // Update state
        state[this.wallet.address] = Date.now();
        this.saveState(state);
        
        // Wait for balance update
        await sleep(10000);
        const balanceAfter = await getBalance(this.wallet);
        logger.info(`Balance after: ${balanceAfter} zkLTC (+${(parseFloat(balanceAfter) - parseFloat(balanceBefore)).toFixed(4)})`);
        
        return true;
      } else {
        logger.error('Request button not found');
        return false;
      }
      
    } catch (e) {
      logger.error(`Faucet claim failed: ${e.message}`);
      return false;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async sendRandomTransactions(count = 5) {
    logger.info(`Sending ${count} random transactions...`);
    
    const provider = this.wallet.provider;
    const balance = await provider.getBalance(this.wallet.address);
    
    if (balance === 0n) {
      logger.error('No balance for transactions');
      return;
    }

    const txAmount = balance / BigInt(count * 10); // Use 10% of balance divided by tx count
    
    for (let i = 0; i < count; i++) {
      try {
        // Generate random address
        const randomWallet = ethers.Wallet.createRandom();
        
        logger.info(`TX ${i + 1}/${count}: Sending ${ethers.formatEther(txAmount)} zkLTC to ${formatAddress(randomWallet.address)}`);
        
        const tx = await this.wallet.sendTransaction({
          to: randomWallet.address,
          value: txAmount
        });
        
        await tx.wait();
        logger.info(`✅ TX ${i + 1} confirmed: ${tx.hash}`);
        
        await randomDelay(5000, 15000);
        
      } catch (e) {
        logger.error(`TX ${i + 1} failed: ${e.message}`);
      }
    }
    
    logger.info('Random transactions completed');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./utils.js').then(async ({ getWallets }) => {
    const wallets = getWallets();
    const wallet = wallets[0];
    
    const claimer = new FaucetClaimer(wallet);
    const success = await claimer.claim();
    
    if (success) {
      await claimer.sendRandomTransactions(5);
    }
    
    process.exit(success ? 0 : 1);
  });
}
