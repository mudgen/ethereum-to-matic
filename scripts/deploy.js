/* global ethers */

// We require the Buidler Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line no-unused-vars
const bre = require('@nomiclabs/buidler')

async function main () {
  // Buidler always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await bre.run('compile');

  // We get the contract to deploy
  const AToken = await ethers.getContractFactory('AToken')
  const aToken = await AToken.deploy('AToken', 'AT')

  await aToken.deployed()

  console.log('AToken deployed to:', aToken.address)
  // goerli 0x47195A03fC3Fc2881D084e8Dc03bD19BE8474E46
  // mumbai 0xa983b3d938eEDf79783CE88ed227A47b6861A3e9
  await aToken['mint()']()

  const accounts = await ethers.getSigners()
  const address = await accounts[0].getAddress()

  const balance = await aToken.balanceOf(address)
  console.log('my balance:' + balance)
  // console.log(aToken)
  /*
  await aToken['transfer(address,uint256)']('0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F', ethers.BigNumber.from('1000000000000000000'))

  balance = await aToken.balanceOf('0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F')
  console.log('contract balance:' + balance)

  balance = await aToken.balanceOf(address)
  console.log('contract balance:' + balance)
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
