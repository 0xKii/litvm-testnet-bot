import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Navigating to LitVM testnet...');
  await page.goto('https://testnet.litvm.com/', { 
    waitUntil: 'networkidle',
    timeout: 60000 
  });
  
  console.log('⏳ Waiting for React to render...');
  await page.waitForTimeout(10000);
  
  // Take screenshot
  await page.screenshot({ path: '/root/litvm-testnet-bot/testnet-page.png', fullPage: true });
  console.log('📸 Screenshot saved');
  
  // Extract all links and categories
  const dapps = await page.evaluate(() => {
    const result = {
      dex: [],
      nft: [],
      domains: [],
      launchpad: [],
      defi: [],
      gaming: [],
      other: []
    };
    
    // Get all links
    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href,
      title: a.title || a.getAttribute('aria-label') || ''
    })).filter(l => l.href && l.href.startsWith('http'));
    
    // Get all text content for categories
    const bodyText = document.body.innerText.toLowerCase();
    
    // Categorize by keywords
    links.forEach(link => {
      const text = (link.text + ' ' + link.href + ' ' + link.title).toLowerCase();
      
      if (text.match(/swap|dex|exchange|trade|liquidity/)) {
        result.dex.push(link);
      } else if (text.match(/nft|mint|collection|stamp/)) {
        result.nft.push(link);
      } else if (text.match(/domain|name|ens|zns/)) {
        result.domains.push(link);
      } else if (text.match(/launch|pad|ido|ico/)) {
        result.launchpad.push(link);
      } else if (text.match(/lend|borrow|stake|yield|defi/)) {
        result.defi.push(link);
      } else if (text.match(/game|play|hero|predict/)) {
        result.gaming.push(link);
      } else if (!text.match(/twitter|telegram|discord|docs|github/)) {
        result.other.push(link);
      }
    });
    
    return result;
  });
  
  console.log('\n📊 DAPPS FOUND:');
  console.log(JSON.stringify(dapps, null, 2));
  
  // Save to file
  const fs = await import('fs');
  fs.writeFileSync('/root/litvm-testnet-bot/dapps.json', JSON.stringify(dapps, null, 2));
  console.log('\n✅ Saved to dapps.json');
  
  await browser.close();
})();
