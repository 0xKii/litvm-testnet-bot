# LitVM Testnet Bot 🚀

Full automation bot for LitVM LiteForge testnet. Interact with 16+ dApps across DEX, NFT, Domains, DeFi, and Gaming categories.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

### ✅ Phase 2: Contract Deployment
- Deploy SimpleStorage contracts
- Automated gas management
- Transaction tracking

### ✅ Phase 3: Ecosystem Interactions
**16 dApps Supported:**
- **DEX (7):** LiteSwap, WolfDex, LitVMSwap, Drunken Cats, Addax, LitDeX, LitiumDEX
- **NFT (4):** OmniHub, StampVM, Mintbrush, Sweep
- **Domains (2):** LitNames, ZNS Connect
- **DeFi (2):** Ayni, Fenus
- **Gaming (1):** LitBillionaire

### ✅ Phase 4: Maintenance Mode
- Random dApp interactions
- Continuous activity
- Anti-pattern detection

### 🎲 Smart Features
- **Random dApp Selection** - Natural behavior, unpredictable patterns
- **Configurable TX Counts** - Control interactions per category via `.env`
- **24/7 Loop Mode** - Automated daily runs
- **State Persistence** - Resume from where you left off

## 📋 Prerequisites

- Node.js v18+ 
- LitVM testnet zkLTC (claim from [faucet](https://liteforge.hub.caldera.xyz/))
- Private key for testnet wallet

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd litvm-testnet-bot
npm install
```

### 2. Configure

Copy example config:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Add your private key (NEVER commit this!)
PRIVATE_KEYS=0xyour_private_key_here

# Configure interactions per run
DEX_SWAPS=3              # 3 DEX swaps
NFT_MINTS=2              # 2 NFT mints
DOMAIN_REGISTERS=1       # 1 domain registration
DEFI_INTERACTIONS=2      # 2 DeFi interactions
GAME_PLAYS=1             # 1 game play
MAINTENANCE_ACTIONS=5    # 5 random actions in Phase 4
```

### 3. Claim Faucet (Manual)

⚠️ **Faucet automation is disabled** due to Vercel Security Checkpoint.

**Manual steps:**
1. Visit: https://liteforge.hub.caldera.xyz/
2. Connect your wallet
3. Solve Turnstile CAPTCHA
4. Claim zkLTC tokens

### 4. Run Bot

**Single run (all phases):**
```bash
npm start once
```

**24/7 loop (runs once per day):**
```bash
npm start loop
```

**Check status:**
```bash
npm start status
```

## 📊 Configuration

### Interaction Counts (`.env`)

Control how many times bot interacts with each category:

```env
# Phase 3 - Ecosystem Interactions
DEX_SWAPS=3              # Number of DEX swaps per run
NFT_MINTS=2              # Number of NFT mints per run
DOMAIN_REGISTERS=1       # Number of domain registrations per run
DEFI_INTERACTIONS=2      # Number of DeFi interactions per run
GAME_PLAYS=1             # Number of game plays per run

# Phase 4 - Maintenance
MAINTENANCE_ACTIONS=5    # Number of random actions per run
```

**Example:** With default config, each run performs:
- Phase 2: 2 contract deployments
- Phase 3: 9 dApp interactions (3+2+1+2+1)
- Phase 4: 5 random actions
- **Total: ~16 transactions per run**

### Network Settings

```env
LITVM_RPC=https://liteforge.rpc.caldera.xyz/http
LITVM_CHAIN_ID=4441
LITVM_EXPLORER=https://liteforge.explorer.caldera.xyz
```

### Automation Settings

```env
TX_PER_DAY=20            # Target transactions per day
GAS_LIMIT_MULTIPLIER=1.2 # Gas limit safety margin
MAX_RETRIES=3            # Retry failed transactions
```

## 🎲 Random dApp Selection

Bot uses **random selection** for natural behavior:

- Each interaction picks a random dApp from the category
- Example: `DEX_SWAPS=3` → Bot picks 3 random DEX (could be WolfDex, LiteSwap, WolfDex again)
- Prevents predictable patterns
- Covers all dApps over time

See [RANDOM-SELECTION.md](./RANDOM-SELECTION.md) for details.

## 📁 Project Structure

```
litvm-testnet-bot/
├── src/
│   ├── index.js              # Entry point
│   ├── phase2-deploy.js      # Contract deployment
│   ├── phase3-ecosystem.js   # dApp interactions (16 dApps)
│   ├── phase4-orchestrate.js # Multi-phase orchestration
│   ├── logger.js             # Logging system
│   └── utils.js              # Utilities & config
├── data/                     # State files (gitignored)
├── logs/                     # Log files (gitignored)
├── .env.example              # Example configuration
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🔒 Security

### ⚠️ CRITICAL: Never Commit Secrets!

**Protected by `.gitignore`:**
- `.env` files
- Private keys
- Wallet configs
- Logs & state files
- Screenshots & debug files

**Before pushing to GitHub:**
```bash
# Check what will be committed
git status

# Verify no sensitive files
git diff --cached

# If you see .env or private keys, DON'T PUSH!
```

### Best Practices

1. ✅ Use `.env.example` for documentation
2. ✅ Never hardcode private keys in code
3. ✅ Use testnet only (no real funds)
4. ✅ Keep `.gitignore` updated
5. ✅ Review commits before pushing

## 📈 Expected Results

### Per Run (with default config)
- ~16 transactions
- 2 contract deployments
- 9 dApp interactions
- 5 maintenance actions

### Daily (24/7 loop mode)
- ~16 transactions per day
- Consistent testnet activity
- Natural interaction patterns
- Coverage across all dApp categories

## 🐛 Troubleshooting

### "Low balance" warning
- Claim faucet manually at https://liteforge.hub.caldera.xyz/
- Wait 24h between claims

### "Transaction failed"
- Check RPC status: https://liteforge.betteruptime.com/
- Increase `GAS_LIMIT_MULTIPLIER` in `.env`

### "Phase X error"
- Check logs: `tail -f logs/litvm-bot.log`
- Verify balance: `npm start status`

## 🌐 Network Info

- **Chain ID:** 4441
- **RPC:** https://liteforge.rpc.caldera.xyz/http
- **Explorer:** https://liteforge.explorer.caldera.xyz/
- **Faucet:** https://liteforge.hub.caldera.xyz/
- **Status:** https://liteforge.betteruptime.com/
- **Docs:** https://docs.litvm.com/

## 📝 Logs

Logs are saved to `logs/litvm-bot.log`

**View logs:**
```bash
tail -f logs/litvm-bot.log
```

**Log levels:**
- `info` - Important events (default)
- `error` - Errors only
- `debug` - Verbose (all events)

Change in `.env`:
```env
LOG_LEVEL=info
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

## ⚠️ Disclaimer

This bot is for **testnet only**. Use at your own risk. Not financial advice.

- No guarantees of airdrop eligibility
- Testnet tokens have no value
- Bot behavior may change with dApp updates

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [LitVM Website](https://litvm.com/)
- [LitVM Docs](https://docs.litvm.com/)
- [LitVM Twitter](https://x.com/litecoinvm)
- [LitVM Telegram](https://t.me/litecoinvm)

---

**Made with ❤️ for LitVM testnet**

⚠️ **Remember:** Never commit your `.env` file or private keys to GitHub!
