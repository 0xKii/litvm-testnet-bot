#!/bin/bash
# LitVM Testnet Bot - Quick Setup Script

set -e

echo "🌙 LitVM Testnet Bot - Setup"
echo "═══════════════════════════════════════════════════════════"

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the litvm-testnet-bot directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

# Create directories
echo "📁 Creating directories..."
mkdir -p data logs config

# Setup .env if not exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add:"
    echo "   - PRIVATE_KEYS (your wallet private keys)"
    echo "   - CAPTCHA_API_KEY (from https://2captcha.com)"
    echo ""
    echo "Run: nano .env"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env file: nano .env"
echo "  2. Add your private keys and 2captcha API key"
echo "  3. Run: npm start once"
echo ""
echo "For help: npm start"
echo "═══════════════════════════════════════════════════════════"
