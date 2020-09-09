import detectEthereumProvider from './detect-provider.js'
import builders from './webscript.modern.js'
import createDOMElement from './createDOMElement.modern.js'
import processClasses from './runcss.modern.js'
import { ethers } from './ethers-5.0.esm.min.js'

// Integrating RunCSS with Webscript
function createElement (type, props, ...children) {
  if (props.class) {
    processClasses(props.class)
  }
  return createDOMElement(type, props, ...children)
}

const { div, body, button, span, a, label, input } = builders(createElement)

const abi = [
  'function balanceOf(address account) public view returns (uint256)',
  'function transfer(address recipient, uint256 amount) public returns (bool)',
  'function mint() external',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function depositFor(address user, address rootToken, bytes calldata depositData) external',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
]

const posERC20Predicate = '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34'
const POSRootChainManager = '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74'
let provider
let currentChainId
let currentAccount
let metaMaskContract
const goerliApproved = false

// 0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74
async function setValues () {
  message = ''
  mumbaiATokenBalance = ethers.utils.formatEther(await mumbaiAToken.balanceOf(currentAccount))
  goerliATokenBalance = ethers.utils.formatEther(await goerliAToken.balanceOf(currentAccount))
  goerliAllowance = await goerliAToken.allowance(currentAccount, posERC20Predicate)
}

async function eventUpdate (from, to, amount, event) {
  // console.log('from: ' + from)
  // console.log('to: ' + to)
  // console.log('current: ' + currentAccount)
  const current = currentAccount.toUpperCase()
  if (from.toUpperCase() === current || to.toUpperCase() === current) {
    await setValues()
    view()
  }
}

// For now, 'eth_accounts' will continue to always return an array
async function handleAccountsChanged (accounts) {
  if (accounts.length === 0) {
    mumbaiATokenBalance = ''
    goerliATokenBalance = ''
    currentAccount = null
    opacity = 30
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.')
  } else if (accounts[0] !== currentAccount) {
    currentChainId = window.ethereum.chainId
    opacity = 100
    currentAccount = accounts[0]
    await setValues()
    // console.log(mumbaiATokenBalance)
    // console.log(goerliATokenBalance)
    const metaMaskProvider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = metaMaskProvider.getSigner()
    if (currentChainId === '0x5') {
      goerliAToken = goerliAToken.connect(signer)
      goerliPosERC20PredicateContract = goerliPosERC20PredicateContract.connect(signer)
      goerliAToken.on('Approval', async (owner) => {
        if (owner.toUpperCase() === currentAccount.toUpperCase()) {
          await setValues()
          view()
        }
      })
      goerliPOSRootChainManagerContract = goerliPOSRootChainManagerContract.connect(signer)
    } else if (currentChainId === '0x13881') {
      mumbaiAToken = mumbaiAToken.connect(signer)
    }
    if (currentChainId === '0x5' || currentChainId === '0x13881') {
      goerliAToken.on('Transfer', eventUpdate)
      mumbaiAToken.on('Transfer', eventUpdate)
    }
  }

  console.log('testing')

  // Do any other work!
  // console.log(result)
  view()
}

function handleChainChanged (_chainId) {
  console.log('reloading chain id')
  // We recommend reloading the page, unless you must do otherwise
  window.location.reload()
}
const goerliATokenAddress = '0x47195A03fC3Fc2881D084e8Dc03bD19BE8474E46'
let mumbaiAToken
let goerliAToken
let mumbaiATokenBalance
let goerliATokenBalance
let goerliPosERC20PredicateContract
let goerliPOSRootChainManagerContract
let goerliAllowance = ethers.BigNumber.from('0')
let opacity
let message
// const goerliValue = ''
async function startup () {
  const goerli = ethers.getDefaultProvider('goerli', { infura: '37b0df2bfa8d412580671665570d81dc' })
  goerliAToken = new ethers.Contract(goerliATokenAddress, abi, goerli)
  const mumbai = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today')
  mumbaiAToken = new ethers.Contract('0xa983b3d938eEDf79783CE88ed227A47b6861A3e9', abi, mumbai)

  goerliPosERC20PredicateContract = new ethers.Contract(posERC20Predicate, abi, goerli)
  goerliPOSRootChainManagerContract = new ethers.Contract(POSRootChainManager, abi, goerli)

  /*
  goerliAToken.on('Transfer', () => {
    message = ''
    view()
  })
  */
  // console.log(mumbaiAToken)

  // console.log(mumbai)

  // this returns the provider, or null if it wasn't detected
  provider = await detectEthereumProvider()
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (!provider || provider !== window.ethereum) {
    // console.error('Do you have multiple wallets installed?')
    const header = div.class`bg-yellow text-black rounded``Please install MetaMask.`
    document.body = body.class`text-center mb-20 text-3xl`(header)
  } else {
    window.ethereum.autoRefreshOnNetworkChange = false
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
        console.error(err)
      })

    // Note that this event is emitted on page load.
    // If the array of accounts is non-empty, you're already
    // connected.
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    /**********************************************************/
    /* Handle chain (network) and chainChanged (per EIP-1193) */
    /**********************************************************/

    // Normally, we would recommend the 'eth_chainId' RPC method, but it currently
    // returns incorrectly formatted chain ID values.

    window.ethereum.on('chainChanged', handleChainChanged)
  }
  // view()
}

function makeButton (onclick, text, disabled) {
  return span.class`inline-flex rounded-md shadow-sm`(
    button
      .type`button`
      .class`${disabled ? 'cursor-not-allowed opacity-20' : ''} inline-flex items-center px-3 py-2 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150`
      .disabled(disabled)
      .onclick(onclick)`${text}`
  )
}

const connectToMetaMask = e => {
  window.ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.')
      } else {
        console.error(err)
      }
    })
}

async function view () {
  console.log('testingnow ')
  let header
  if (!provider) {

  } else if (!currentAccount) {
    header = makeButton(connectToMetaMask, 'Connect to MetaMask')
  } else if (currentChainId === '0x5') {
    header = div.class`bg-green text-gray-100 rounded``Connected to Goerli Test Network`
  } else if (currentChainId === '0x13881') {
    header = div.class`bg-green text-gray-100 rounded``Connected to Matic Mumbai Test Network`
  } else {
    header = div.class`bg-yellow text-black rounded-lg`(
      div.class`text-2xl mb-2``Please connect to Goerli or Matic Mumbai`,
      div`If you haven't, add Matic Mumbai to MetaMask.`,
      div`URL is https://rpc-mumbai.matic.today`,
      div`ChainID: 80001`
    )
    // console.log(currentChainId)
  }

  // const goerliTokenContent =

  const content =
    div.class`flex text-xl opacity-${opacity}`(
      div.class`flex-1 my-3 mr-2 border-4 text-center rounded`(
        span.class`text-2xl``Goerli AToken`,
        div.class`bg-blue-200 text-3xl``${goerliATokenBalance}`,
        div.class`mt-3`(
          makeButton(async (e) => {
            await goerliAToken.mint()
            message = 'Minting ATokens.... Please wait.'
            view()
          }, 'Mint 25 AToken', currentChainId !== '0x5')
        ),
        div.class`mt-3`(
          makeButton(async (e) => {
            await goerliAToken.approve(posERC20Predicate, ethers.utils.parseEther('1000000000000000000000000'))
            message = 'Approving ATokens.... Please wait.'
            view()
          }, 'AToken Approve', currentChainId !== '0x5' || goerliAllowance.gt(0))
        ),
        div.class`text-center`(
          div.class`mt-6`(
            input
              .id`transfer-amount-to-mumbai`
              .class`form-input border-3 w-25 text-center`
              .type`number`
              .step`0.1`
              // .value(goerliValue)
              .placeholder`0.0`
          ),
          div.class`mt-1 mb-10`(
            makeButton(async (e) => {
              const value = document.getElementById('transfer-amount-to-mumbai').value
              // goerliValue = value
              if (value <= 0) {
                return
              }
              const tokenValue = ethers.utils.parseEther(value)
              const calldata = ethers.utils.defaultAbiCoder.encode(['uint'], [tokenValue])
              // console.log(calldata)
              await goerliPOSRootChainManagerContract.depositFor(currentAccount, goerliATokenAddress, calldata)
              // await goerliAToken.transfer('0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74', ethers.utils.parseEther(value))
              message = `Bridging ${value} ATokens to Mumbai. This could take a few minutes.`
              view()
            }, 'Bridge to Mumbai', currentChainId !== '0x5' || goerliAllowance.eq(0))
          )

          // div.class`mt-1 flex rounded-md shadow-sm border`(
          //   div.class`relative flex-grow focus-within:z-10 self-center items-center`(
          //     div.class`inset-y-0 pl-1 flex pointer-events-none`(
          //       input.id`aToken`
          //         .class`form-input block w-30 rounded-none rounded-l-md -pr-15 transition ease-in-out duration-150`
          //         .placeholder`0.0`),
          //     button.class`ml-0 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:text-gray-500 hover:bg-white focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150`(
          //       span.class`ml-2``Sort`)))
        )
      ),
      div.class`flex-1 my-3 ml-2 border-4 text-center rounded`(
        span.class`text-2xl``Matic Mumbai AToken`,
        div.class`bg-blue-200 text-3xl``${mumbaiATokenBalance}`
      )
    )

  const app = div.class`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5`(
    div.class`max-w-4xl mx-auto bg-gray-100 rounded-lg border-5`(
      div.class`p-5`(
        div.class`text-center text-6xl -mt-8``AToken Bridge`,
        div.class`text-center text-xl`(header),
        div.class`text-center text-2xl rounded ${message ? 'py-6 mt-2' : ''} bg-teal-200`(message),
        content
      )
    )
  )
  document.body = body.class`bg-blue-100`(app)
}

startup()
