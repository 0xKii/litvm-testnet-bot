import { ethers } from 'ethers';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

export const config = {
  rpc: process.env.LITVM_RPC || 'https://liteforge.rpc.caldera.xyz/http',
  chainId: parseInt(process.env.LITVM_CHAIN_ID || '4441'),
  explorer: process.env.LITVM_EXPLORER || 'https://liteforge.explorer.caldera.xyz',
  faucetUrl: 'https://liteforge.hub.caldera.xyz/',
  captchaKey: process.env.CAPTCHA_API_KEY,
  proxyList: process.env.PROXY_LIST?.split(',').filter(p => p.trim()) || [],
  faucetInterval: parseInt(process.env.FAUCET_INTERVAL_HOURS || '24') * 3600000,
  txPerDay: parseInt(process.env.TX_PER_DAY || '10'),
  gasLimitMultiplier: parseFloat(process.env.GAS_LIMIT_MULTIPLIER || '1.2'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  dexSwapAmount: process.env.DEX_SWAP_AMOUNT || '0.001',
  nftMintEnabled: process.env.NFT_MINT_ENABLED === 'true',
  domainRegisterEnabled: process.env.DOMAIN_REGISTER_ENABLED === 'true',
  multiAccountEnabled: process.env.MULTI_ACCOUNT_ENABLED === 'true',
  accountDelay: parseInt(process.env.ACCOUNT_DELAY_SECONDS || '60') * 1000,
  randomizeActions: process.env.RANDOMIZE_ACTIONS === 'true'
};

export function getProvider() {
  return new ethers.JsonRpcProvider(config.rpc);
}

export function getWallets() {
  const privateKeys = process.env.PRIVATE_KEYS?.split(',').filter(k => k.trim());
  if (!privateKeys || privateKeys.length === 0) {
    throw new Error('No private keys configured in .env');
  }
  
  const provider = getProvider();
  const wallets = privateKeys.map(key => new ethers.Wallet(key.trim(), provider));
  
  logger.info(`✅ Loaded ${wallets.length} accounts`);
  if (config.proxyList.length > 0) {
    logger.info(`✅ Loaded ${config.proxyList.length} proxies`);
  } else {
    logger.warn('⚠️  No proxies configured (running without proxy)');
  }
  
  return wallets;
}

export function getProxyForAccount(accountIndex) {
  if (config.proxyList.length === 0) {
    return null;
  }
  
  // Round-robin proxy assignment
  const proxyIndex = accountIndex % config.proxyList.length;
  return config.proxyList[proxyIndex].trim();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomDelay(min = 5000, max = 15000) {
  return sleep(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function waitForTx(tx, description = 'Transaction') {
  logger.info(`${description} sent: ${tx.hash}`);
  const receipt = await tx.wait();
  logger.info(`${description} confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

export function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function getBalance(wallet) {
  const balance = await wallet.provider.getBalance(wallet.address);
  return ethers.formatEther(balance);
}

export async function estimateGasWithBuffer(tx) {
  const estimated = await tx.estimateGas();
  return (estimated * BigInt(Math.floor(config.gasLimitMultiplier * 100))) / 100n;
}

logger.info('Config loaded successfully');
