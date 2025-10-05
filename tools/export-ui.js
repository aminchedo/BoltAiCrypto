const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.EXPORT_BASE_URL || 'http://localhost:5173/';
const outDir = path.join(process.cwd(),'static_preview');

(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle').catch(()=>{});
  await page.waitForTimeout(2000);
  let routes = await page.evaluate(()=>{
    const a = Array.from(document.querySelectorAll('a[href^="#/"]')).map(x=>x.getAttribute('href'));
    const s = new Set(a.filter(Boolean));
    if(!s.has('#/dashboard')) s.add('#/dashboard');
    if(!s.has('#/scanner')) s.add('#/scanner');
    if(!s.has('#/portfolio')) s.add('#/portfolio');
    if(!s.has('#/training')) s.add('#/training');
    if(!s.has('#/backtest')) s.add('#/backtest');
    if(!s.has('#/watchlist')) s.add('#/watchlist');
    if(!s.has('#/settings')) s.add('#/settings');
    if(!s.has('#/ai')) s.add('#/ai');
    return Array.from(s);
  });
  console.log('Routes found:', routes);
  await page.goto(baseUrl+'#/dashboard');
  await page.waitForLoadState('networkidle').catch(()=>{});
  await page.waitForTimeout(2000);
  const linkHrefs = await page.evaluate(()=>Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l=>l.href));
  const inlineStyles = await page.evaluate(()=>Array.from(document.querySelectorAll('style')).map(s=>s.textContent||''));
  let extractedCSS = '';
  for(const href of linkHrefs){
    const res = await page.request.get(href);
    extractedCSS += await res.text() + '\n';
  }
  extractedCSS += inlineStyles.join('\n');
  fs.mkdirSync(outDir,{recursive:true});
  const distAssets = path.join(process.cwd(),'dist','assets');
  if(fs.existsSync(distAssets)){
    fs.cpSync(distAssets, path.join(outDir,'assets'), { recursive:true });
    extractedCSS = extractedCSS.replace(/url\((['"]?)(\/)?assets\//g,'url($1assets/');
  }
  let sections = '';
  let capturedRoutes = [];
  let failedRoutes = [];
  for(const r of routes){
    console.log('Capturing route:', r);
    await page.goto(baseUrl + r);
    await page.waitForLoadState('networkidle').catch(()=>{});
    await page.waitForTimeout(2000);
    let html = await page.evaluate(()=>{
      const root = document.querySelector('#root') || document.body;
      return root.innerHTML;
    });
    if(html && html.trim().length > 0){
      html = html.replace(/(["'(])\/assets\//g,'$1assets/');
      const id = (r.replace(/^#\//,'') || 'dashboard').replace(/[^a-zA-Z0-9_-]/g,'_');
      sections += `<section data-route="${r}" id="${id}">${html}</section>\n`;
      capturedRoutes.push(r);
      console.log('Captured route:', r, '- HTML length:', html.length);
    }else{
      failedRoutes.push(r);
      console.log('Failed to capture route:', r, '- HTML was empty');
    }
  }
  const dirAttr = await page.evaluate(()=>document.documentElement.getAttribute('dir')||'rtl');
  const title = await page.evaluate(()=>document.title || 'Static Preview');
  const indexHtml = `<!doctype html>
<html lang="fa" dir="${dirAttr}">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} — Static Preview</title>
<link rel="stylesheet" href="styles.css"/>
</head>
<body>
<main id="app">
${sections}
</main>
<script src="app.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(outDir,'styles.css'), extractedCSS);
  fs.writeFileSync(path.join(outDir,'index.html'), indexHtml);
  const appJs = `(function(){var s=Array.from(document.querySelectorAll('main section'));function show(h){if(!h)h='#/dashboard';s.forEach(x=>{x.style.display=(x.dataset.route===h)?'block':'none'});}window.addEventListener('hashchange',function(){show(location.hash)});show(location.hash);})();`;
  fs.writeFileSync(path.join(outDir,'app.js'), appJs);
  const statusReport = {
    capturedRoutes,
    failedRoutes,
    totalRoutes: routes.length,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(outDir,'export-status.json'), JSON.stringify(statusReport, null, 2));
  console.log('\nExport Summary:');
  console.log('Captured routes:', capturedRoutes.length);
  console.log('Failed routes:', failedRoutes.length);
  console.log('Total routes:', routes.length);
  await browser.close();
})();
