const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const watchDirs = ['app', 'components', 'lib', 'functions', 'scripts'];
let debounceTimer = null;
let isDeploying = false;

console.log("====================================================");
console.log("   JobPilot Auto-Deploy Watcher (insforge.site)     ");
console.log("====================================================");
console.log("Watching for edits in:");
watchDirs.forEach(d => console.log(`  📁 ${d}/`));
console.log("----------------------------------------------------");

function runDeploy(modifiedFile) {
  if (isDeploying) {
    // If already deploying, schedule another run right after
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runDeploy(modifiedFile), 2000);
    return;
  }

  isDeploying = true;
  console.log(`\n⚡ Change detected in: ${modifiedFile}`);
  console.log("⏳ Committing and pushing changes to origin main...");

  exec('git add . && git commit -m "Auto-deploy: local edits" && git push origin main', (error, stdout, stderr) => {
    isDeploying = false;
    if (error) {
      console.error(`❌ [ERROR] Deploy push failed:`, error.message);
      if (stderr) console.error(stderr.trim());
      return;
    }
    console.log(`✅ [SUCCESS] Pushed changes successfully! insforge.site is updating.`);
    console.log("----------------------------------------------------");
  });
}

function onChange(eventType, filename, dir) {
  if (!filename) return;
  // Ignore dotfiles, temp files, node_modules, and git files
  if (
    filename.includes('.git') || 
    filename.includes('node_modules') || 
    filename.endsWith('~') || 
    filename.startsWith('.') ||
    filename.includes('watch-deploy.js')
  ) {
    return;
  }

  const relativePath = path.join(dir, filename);

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runDeploy(relativePath), 2000); // 2 second debounce
}

watchDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
      onChange(eventType, filename, dir);
    });
  }
});
