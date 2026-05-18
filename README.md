# LitVM Testnet Bot 🚀

Automated bot untuk LitVM LiteForge Testnet dengan support multi-account (101 akun) dan proxy rotation.

## Features

✅ **Multi-Account Support** - 101 akun parallel processing  
✅ **Proxy Rotation** - 1:1 proxy assignment per akun  
✅ **Phase 1-4 Automation**:
- Phase 1: Faucet claim + basic transactions
- Phase 2: Smart contract deployment (ERC20 + NFT)
- Phase 3: Ecosystem interaction (23 dApps)
- Phase 4: Maintenance mode (keep active)

✅ **24/7 Loop Mode** - Auto-run setiap 24 jam  
✅ **State Tracking** - Per-account progress tracking  
✅ **Anti-Detection** - Random delays, human-like behavior

## Network Details

| Parameter | Value |
|-----------|-------|
| **Chain ID** | 4441 |
| **Native Token** | zkLTC |
| **RPC** | https://liteforge.rpc.caldera.xyz/http |
| **Explorer** | https://liteforge.explorer.caldera.xyz/ |
| **Faucet** | https://liteforge.hub.caldera.xyz/ |

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` dan isi:
```env
# Private keys (comma-separated)
PRIVATE_KEYS=0x...,0x...,0x...

# 2Captcha API key (untuk faucet)
CAPTCHA_API_KEY=your_api_key

# Proxies (comma-separated, optional)
PROXY_LIST=http://user:pass@host:port,http://...
```

## Usage

### Test Run (3 akun)
```bash
node test-3-accounts.js
```

### Single Cycle (semua akun)
```bash
node src/phase4-orchestrate.js once
```

### 24/7 Loop Mode
```bash
node src/phase4-orchestrate.js loop
```

### Background Mode
```bash
bash run-24h.sh
```

## Project Structure

```
litvm-testnet-bot/
├── src/
│   ├── phase1-faucet.js       # Faucet automation
│   ├── phase2-deploy.js       # Contract deployment
│   ├── phase3-ecosystem.js    # dApp interactions
│   ├── phase4-orchestrate.js  # Multi-account orchestrator
│   ├── utils.js               # Utilities & config
│   └── logger.js              # Logging system
├── config/                    # Contract ABIs & addresses
├── data/                      # State & deployment data
├── logs/                      # Log files
├── .env.example              # Environment template
├── package.json
└── README.md
```

## Ecosystem Support (23 dApps)

### DEX (7)
- LiteSwap, WolfDex, LitVMSwap, Drunken Cats, Addax, LitDeX, LitiumDEX

### NFT (5)
- OmniHub, StampVM, Mintbrush, Sweep, Faros Beacon

### Domains (3)
- LitNames, InfinityName, ZNS Connect

### Launchpad (2)
- OnmiFun, Lester Labs

### DeFi (2)
- Ayni, Fenus

### Gaming (4)
- LitBillionaire, Last Hero, MidasPredict, Penny4Thots

## Safety Features

- ✅ Conservative gas limits (1.2x multiplier)
- ✅ Random delays between actions (5-15s)
- ✅ Account delay between processing (60s + jitter)
- ✅ Retry logic (max 3 retries)
- ✅ State persistence (resume from last position)

## Monitoring

Logs tersimpan di `logs/litvm-bot.log`:
```bash
tail -f logs/litvm-bot.log
```

## Cost Estimation

Per 101 akun (monthly):
- **Proxies:** ~$100/month (residential)
- **2Captcha:** ~$30/month
- **Total:** ~$130/month

## Troubleshooting

### Faucet claim gagal
- Check 2Captcha balance
- Verify proxy working
- Wait 24h cooldown

### Transaction gagal
- Check zkLTC balance
- Verify RPC endpoint
- Increase gas limit multiplier

### Proxy error
- Test proxy connectivity
- Rotate to different proxy
- Check proxy credentials

## Security

⚠️ **NEVER commit:**
- `.env` file
- Private keys
- Proxy credentials
- Log files with sensitive data

## License

MIT

## Disclaimer

Bot ini untuk educational purposes. Gunakan dengan bijak dan ikuti terms of service dari LitVM testnet.

---

**Built with ❤️ for LitVM LiteForge Testnet**
