const path = require('path')
const execSync = require('child_process').execSync

function exec(cmd) {
  execSync(cmd, { stdio: 'inherit', env: process.env })
}

const cwd = process.cwd()

;['packages/contracts', 'packages/graphql', 'dapps/marketplace'].forEach(
  packageName => {
    process.chdir(path.resolve(__dirname, '../' + packageName))
    exec('yarn test')
  }
)

process.chdir(cwd)
