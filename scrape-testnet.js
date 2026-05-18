import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to LitVM testnet...');
  await page.goto('https://testnet.litvm.com/', { waitUntil: 'networkidle', timeout: 30000 });
  
  await page.waitForTimeout(5000);
  
  // Extract all links and buttons
  const content = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim(),
      href: a.href
    }));
    
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim()
    }));
    
    const sections = Array.from(document.querySelectorAll('section, div[class*="section"]')).map(s => ({
      text: s.textContent?.trim().substring(0, 200)
    }));
    
    return { links, buttons, sections, html: document.body.innerHTML.substring(0, 5000) };
  });
  
  console.log(JSON.stringify(content, null, 2));
  
  await browser.close();
})();
