import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/profile?github=tashifkhan&leetcode=khan-tashif&codechef=vanshavenger&hackerrank=shauryarahlon_10&gfg=adarshsharc3pj&codeforces=AdarSharma');
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
