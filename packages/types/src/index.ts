import type { EventEmitter } from 'node:events'
import type { StoreApi } from '@web3-vue-org/x'

export interface Web3VueState {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
  changing: boolean
}

export type Web3VueStore = StoreApi<Web3VueState>

export type Web3VueStateUpdate =
  | {
      chainId: number
      accounts: string[]
      changing: boolean
    }
  | {
      chainId: number
      accounts?: never
      changing?: never
    }
  | {
      chainId?: never
      accounts: string[]
      changing?: never
    }
  | {
      chainId?: never
      accounts?: never
      changing: boolean
    }
  | {
      chainId: number
      accounts: string[]
      changing?: never
    }
  | {
      chainId: number
      accounts?: never
      changing: boolean
    }
  | {
      chainId?: never
      accounts: string[]
      changing: boolean
    }

export interface Actions {
  startActivation: () => () => void
  update: (stateUpdate: Web3VueStateUpdate) => void
  resetState: () => void
}

// per EIP-1193
export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

// per EIP-1193
export interface Provider extends EventEmitter {
  request(args: RequestArguments): Promise<unknown>
}

// per EIP-1193
export interface ProviderConnectInfo {
  readonly chainId: string
}

// per EIP-1193
export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export class UnSupportedChainError extends Error {
  constructor(chainId: number) {
    super(`UnSupported ChainId:  ${chainId}`)
  }
}

// per EIP-3085
export interface AddEthereumChainParameter {
  chainId: number
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

// per EIP-747
export interface WatchAssetParameters {
  address: string // The address that the token is at.
  symbol: string // A ticker symbol or shorthand, up to 5 chars.
  decimals: number // The number of decimals in the token
  image: string // A string url of the token logo
}

export abstract class Connector {
  /**
   * An
   * EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) and
   * EIP-1102 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md}) compliant provider.
   * May also comply with EIP-3085 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3085.md}).
   * This property must be defined while the connector is active, unless a customProvider is provided.
   */
  public provider?: Provider

  /**
   * An optional property meant to allow ethers providers to be used directly rather than via the experimental
   * 1193 bridge. If desired, this property must be defined while the connector is active, in which case it will
   * be preferred over provider.
   */
  public customProvider?: unknown

  public readonly supportAddChain: boolean

  protected readonly actions: Actions

  /**
   * An optional handler which will report errors thrown from event listeners. Any errors caused from
   * user-defined behavior will be thrown inline through a Promise.
   */
  protected onError?: (error: Error) => void

  /**
   * @param actions - Methods bound to a zustand store that tracks the state of the connector.
   * @param supportAddChain - set Connector is support add chain or not
   * @param onError - An optional handler which will report errors thrown from event listeners.
   * Actions are used by the connector to report changes in connection status.
   */
  constructor(actions: Actions, supportAddChain = false, onError?: (error: Error) => void) {
    this.actions = actions
    this.onError = onError
    this.supportAddChain = supportAddChain
  }

  /**
   * Reset the state of the connector without otherwise interacting with the connection.
   */
  public resetState(): Promise<void> | void {
    this.actions.resetState()
  }

  protected abstract _activate(...args: unknown[]): Promise<void>

  /**
   * Initiate a connection.
   */
  public abstract activate(...args: unknown[]): Promise<void> | void

  protected startActive(connected: boolean, ...args: unknown[]) {
    let cancelActivation: () => void
    if (!connected) cancelActivation = this.actions.startActivation()
    this.actions.update({ changing: true })
    return this._activate(...args)
      .catch((e) => {
        cancelActivation?.()
        throw e
      })
      .finally(() => this.actions.update({ changing: false }))
  }

  /**
   * Attempt to initiate a connection, failing silently
   */
  public connectEagerly?(...args: unknown[]): Promise<void> | void

  /**
   * Un-initiate a connection. Only needs to be defined if a connection requires specific logic on disconnect.
   */
  public deactivate?(...args: unknown[]): Promise<void> | void

  /**
   * Attempt to add an asset per EIP-747.
   */
  public watchAsset?(params: WatchAssetParameters): Promise<true>
}
