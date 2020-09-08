/* global task usePlugin ethers */
usePlugin('@nomiclabs/buidler-waffle')

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.getAddress())
  }
})

const fs = require('fs')
// eslint-disable-next-line no-unused-vars
const account = fs.readFileSync('.secret', 'utf8')

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  networks: {
    goerli: {
      url: 'https://goerli.infura.io/v3/37b0df2bfa8d412580671665570d81dc',
      accounts: [account]
    },
    matic: {
      url: 'https://rpc-mumbai.matic.today',
      accounts: [account]
    }
  },
  // This is a sample solc configuration that specifies which version of solc to use
  solc: {
    version: '0.5.17'
  }
}
