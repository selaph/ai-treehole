import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const assetsDir = path.join(distDir, 'assets');
const releasesDir = path.join(projectRoot, 'releases');
const zipPath = path.join(releasesDir, 'ai-treehole-local-dist.zip');
const indexPath = path.join(distDir, 'index.html');

let html = readFileSync(indexPath, 'utf8');
const moduleScriptMatch = html.match(/<script\s+type="module"[^>]*\bsrc="\.\/assets\/([^"]+\.js)"[^>]*><\/script>/);

if (!moduleScriptMatch) {
  throw new Error('Could not find the Vite module script in dist/index.html');
}

const jsFile = path.join(assetsDir, moduleScriptMatch[1]);
const js = readFileSync(jsFile, 'utf8');

html = html
  .replace(/\n?\s*<script\s+type="importmap">[\s\S]*?<\/script>/, '')
  .replace(moduleScriptMatch[0], '')
  .replace('</body>', () => `  <script>\n${js}\n</script>\n</body>`);

writeFileSync(indexPath, html);
rmSync(assetsDir, { recursive: true, force: true });
mkdirSync(releasesDir, { recursive: true });
rmSync(zipPath, { force: true });

const zipArgs = ['-q', '-r', zipPath, 'dist'];
execFileSync('zip', zipArgs, { cwd: projectRoot, stdio: 'inherit' });

const files = readdirSync(distDir);
if (files.length !== 1 || files[0] !== 'index.html') {
  throw new Error(`Expected local package dist to contain only index.html, found: ${files.join(', ')}`);
}

console.log(`Created ${path.relative(projectRoot, zipPath)}`);
