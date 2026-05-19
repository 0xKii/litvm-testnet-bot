# LitVM Bot - Random dApp Selection

## Apa itu Random dApp Selection?

Bot punya **16 dApps** yang bisa di-interact:
- 7 DEX (LiteSwap, WolfDex, LitVMSwap, dll)
- 4 NFT (OmniHub, StampVM, Mintbrush, Sweep)
- 2 Domains (LitNames, ZNS Connect)
- 2 DeFi (Ayni, Fenus)
- 1 Gaming (LitBillionaire)

**Random Selection** = Setiap kali bot mau interact, dia **pilih random** dari list.

## Contoh:

### Kalau config: `DEX_SWAPS=3`

Bot akan:
1. Swap #1 → Pilih random DEX (misal: **WolfDex**)
2. Swap #2 → Pilih random DEX lagi (misal: **LiteSwap**)
3. Swap #3 → Pilih random DEX lagi (misal: **WolfDex** lagi)

**Hasilnya:** Bot interact dengan 3 DEX berbeda (atau bisa sama kalau random-nya kebetulan sama)

### Kalau config: `NFT_MINTS=2`

Bot akan:
1. Mint #1 → Pilih random NFT (misal: **StampVM**)
2. Mint #2 → Pilih random NFT (misal: **Sweep**)

**Hasilnya:** Bot mint di 2 NFT platform berbeda

## Kenapa Random?

✅ **Anti-pattern detection** - Tidak predictable
✅ **Natural behavior** - Seperti user real
✅ **Coverage** - Semua dApp ke-cover over time
✅ **Flexible** - Tidak stuck di 1 dApp aja

## Mode Selection (di .env):

```env
DAPP_SELECTION_MODE=random
```

**Options:**
- `random` = Pilih random (default) ✅
- `all` = Interact dengan semua dApp satu per satu (coming soon)
- `specific` = Hanya dApp tertentu (coming soon)

## Lihat Code:

File: `/root/litvm-testnet-bot/src/phase3-ecosystem.js`

```javascript
async swapOnDEX(amountInETH = 0.0001) {
  const dexList = DAPPS.dex;  // 7 DEX
  const randomDex = dexList[Math.floor(Math.random() * dexList.length)];  // ← RANDOM!
  
  logger.info(`💱 Swapping on ${randomDex.name}...`);
  // ... swap logic
}
```

Setiap function (swap, mint, register, dll) pakai random selection!

## Summary:

**Random Selection** = Bot pintar pilih dApp sendiri, jadi kamu gak perlu specify mana yang mau di-interact. Bot akan spread interactions across semua dApps secara natural! 🎲
