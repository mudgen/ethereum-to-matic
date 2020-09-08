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

const { div, body, button, span, a } = builders(createElement)

const abi = [
  'function balanceOf(address account) public view returns (uint256)',
  'function transfer(address recipient, uint256 amount) public returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]

let provider
let currentChainId
let currentAccount

// For now, 'eth_accounts' will continue to always return an array
async function handleAccountsChanged (accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.')
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0]
    const result = await mumbaiAToken.balanceOf(currentAccount)
    // Do any other work!
    console.log(result)
  }
  view()
}

function handleChainChanged (_chainId) {
  // We recommend reloading the page, unless you must do otherwise
  window.location.reload()
}

let mumbaiAToken
async function startup () {
  const goerli = ethers.getDefaultProvider('goerli', { infura: '37b0df2bfa8d412580671665570d81dc' })
  const mumbai = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today')
  mumbaiAToken = new ethers.Contract('0xa983b3d938eEDf79783CE88ed227A47b6861A3e9', abi, mumbai)
  // console.log(mumbaiAToken)

  console.log(mumbai)

  // this returns the provider, or null if it wasn't detected
  provider = await detectEthereumProvider()
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (!provider || provider !== window.ethereum) {
    // console.error('Do you have multiple wallets installed?')
    const header = div.class`bg-yellow text-black rounded``Please install MetaMask.`
    document.body = body.class`text-center mb-20 text-3xl`(header)
  } else {
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

function makeButton (onclick, text) {
  return span.class`inline-flex rounded-md shadow-sm`(
    button
      .type`button`
      .class`inline-flex items-center px-3 py-2 border border-transparent text-base leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150`
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
  currentChainId = window.ethereum.chainId
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
    console.log(currentChainId)
  }

  const content =
    div.class`flex text-xl`(
      div.class`flex-1 m-3 border-4 text-center rounded`(
        span.class`text-2xl``Goerli AToken`,
        div.class``
      ),
      div.class`flex-1 m-3 border-4 text-center rounded`(
        span.class`text-2xl``Matic Mumbai AToken`
      )
    )

  const app = div.class`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5`(
    div.class`max-w-4xl mx-auto`(
      div.class`text-center text-xl`(header),
      content
    )
  )
  document.body = body.class``(app)
}

startup()
