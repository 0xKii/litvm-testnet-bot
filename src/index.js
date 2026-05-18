import dotenv from 'dotenv';
import logger from './logger.js';
import { MultiAccountOrchestrator } from './phase4-orchestrate.js';

dotenv.config();

async function main() {
  logger.info('🌙 LitVM Testnet Bot - Full Automation');
  logger.info('═'.repeat(60));
  
  const mode = process.argv[2] || 'help';
  
  switch (mode) {
    case 'once':
      logger.info('Mode: Single run (all phases)');
      const orchestrator = new MultiAccountOrchestrator();
      await orchestrator.runOnce();
      break;
      
    case 'loop':
      logger.info('Mode: 24/7 loop (once per day)');
      const looper = new MultiAccountOrchestrator();
      await looper.start24HourLoop();
      break;
      
    case 'status':
      logger.info('Mode: Status check');
      const statusOrch = new MultiAccountOrchestrator();
      statusOrch.printSummary();
      break;
      
    default:
      console.log(`
LitVM Testnet Bot - Usage:

  npm start once       - Run all phases once for all accounts
  npm start loop       - Run 24/7 (auto loop once per day)
  npm start status     - Show account status summary

Individual phases:
  npm run faucet       - Phase 1: Faucet claim + basic TXs
  npm run deploy       - Phase 2: Contract deployment
  npm run ecosystem    - Phase 3: Ecosystem interaction
  npm run orchestrate  - Phase 4: Multi-account orchestration

Configuration:
  Edit .env file to configure accounts, intervals, and features
      `);
      break;
  }
}

main().catch(e => {
  logger.error('Fatal error:', e);
  process.exit(1);
});
