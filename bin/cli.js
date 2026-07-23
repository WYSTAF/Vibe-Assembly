#!/usr/bin/env node

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const banner = `

${YELLOW}${BOLD} █░█ ░█░ █▄▄ █▀▀   ▄▀█ █▀▀ █▀▀ █▀▀ █▀▄▀█ █▄▄ █░░ █▄█ ${RESET}
${YELLOW}${BOLD} ▀▄▀ ░█░ █▄█ ██▄   █▀█ ▄█░ ▄█░ ██▄ █░▀░█ █▄█ █▄▄ ░█░ ${RESET}
`;

const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

function isSafeProjectName(name) {
  if (!name || typeof name !== 'string') return false;
  if (name === '.' || name === '..') return false;
  if (name.includes('/') || name.includes('\\')) return false;
  if (path.isAbsolute(name)) return false;
  return SAFE_NAME.test(name);
}

function askGraphify() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Would you like to install Graphify for visual codebase analysis? (y/N): ', (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'y' || trimmed === 'yes');
    });
  });
}

function initMetadata(projectName, projectPath) {
  try {
    const configPath = path.join(projectPath, '.ai', 'project_config.md');
    if (fs.existsSync(configPath)) {
      let content = fs.readFileSync(configPath, 'utf8');
      content = content.replace(/CHANGE_ME_PROJECT_NAME/g, projectName);
      fs.writeFileSync(configPath, content, 'utf8');
    }
  } catch (_) { /* skip silently */ }

  try {
    const pkgPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.name = projectName;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    }
  } catch (_) { /* skip silently */ }
}

async function main() {
  const projectName = process.argv[2];

  console.log(banner);

  if (!isSafeProjectName(projectName)) {
    console.error('\n❌ Error: Please specify a safe project directory name:');
    console.error('   npx create-vibe-assembly <project-name>');
    console.error('   Allowed: letters, numbers, dots, underscores, hyphens. No path separators.\n');
    process.exit(1);
  }

  const currentPath = process.cwd();
  const projectPath = path.join(currentPath, projectName);
  const pkg = require('../package.json');
  const gitRepo = process.env.VIBE_TEMPLATE_REPO || pkg.repository.url;

  if (!/^https?:\/\//i.test(gitRepo) || /shadcn\/improve/i.test(gitRepo)) {
    console.error('\n❌ Error: Invalid template repository URL.');
    console.error('   Set package.json repository.url or VIBE_TEMPLATE_REPO to an https git URL.\n');
    process.exit(1);
  }

  try {
    console.log(`\n🚀 Bootstrapping Vibe Assembly in ${projectPath}...`);

    console.log(`\n📥 Cloning template...`);
    execFileSync('git', ['clone', '--depth', '1', gitRepo, projectName], { stdio: 'inherit' });

    process.chdir(projectPath);

    console.log(`\n📝 Initializing project metadata...`);
    initMetadata(projectName, projectPath);

    console.log(`\n🧹 Cleaning template history...`);
    fs.rmSync(path.join(projectPath, '.git'), { recursive: true, force: true });

    console.log(`\n🌱 Initializing fresh Git repository...`);
    execFileSync('git', ['init'], { stdio: 'inherit' });

    console.log(`\n🛡️ Activating AI architecture guardrails...`);
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });

    const wantGraphify = await askGraphify();

    if (wantGraphify) {
      console.log(`\n📦 Cloning Graphify...`);
      try {
        execFileSync('git', ['clone', '--depth', '1', 'https://github.com/Graphify-Labs/graphify', path.join(projectPath, 'app', 'graphify')], { stdio: 'inherit' });
        console.log(`\n🔧 Setting up Graphify...`);
        try {
          execFileSync('python', ['--version'], { stdio: 'ignore' });
          try {
            execFileSync('python', ['-m', 'graphify', 'install', '--project'], { cwd: path.join(projectPath, 'app', 'graphify'), stdio: 'inherit' });
          } catch (_) {
            console.log('\n⚠️ Graphify install command failed. You can run it manually later.');
          }
        } catch (_) {
          console.log('\n⚠️ Graphify cloned but Python not found. Run \'python -m graphify install --project\' inside app/graphify/ later.');
        }
      } catch (_) {
        console.log('\n⚠️ Failed to clone Graphify. You can install it later from https://github.com/Graphify-Labs/graphify');
      }
    } else {
      console.log('\n⏭️ Skipping Graphify. You can install it later with:\n   cd app/\n   git clone --depth 1 https://github.com/Graphify-Labs/graphify\n   cd graphify\n   python -m graphify install --project');
    }

    console.log(`\n✅ Setup complete! Welcome to Vibe Assembly.`);
    console.log(`\n👉 Next steps:`);
    console.log(`   cd ${projectName}`);
    console.log(`   Open the folder in your IDE, start Roo Code, and let the Boss take over!\n`);
  } catch (error) {
    console.error('\n🛑 Installation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = { isSafeProjectName };
}
