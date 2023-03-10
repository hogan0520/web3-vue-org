import { CoinbaseWallet } from '@web3-vue-org/coinbase-wallet'
import { MetaMask } from '@web3-vue-org/metamask'
import { Network } from '@web3-vue-org/network'
import { WalletConnect } from '@web3-vue-org/walletconnect'
import type { Connector } from '@web3-vue-org/types'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network'
  return 'Unknown'
}
