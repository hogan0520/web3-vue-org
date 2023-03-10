import { createWeb3VueStoreAndActions, MAX_SAFE_CHAIN_ID } from '.'

describe('#createWeb3VueStoreAndActions', () => {
  test('uninitialized', () => {
    const [store] = createWeb3VueStoreAndActions()
    expect(store.getState()).toEqual({
      chainId: undefined,
      accounts: undefined,
      activating: false,
      error: undefined,
      changing: false,
    })
  })

  describe('#startActivation', () => {
    test('works', () => {
      const [store, actions] = createWeb3VueStoreAndActions()
      actions.startActivation()
      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: true,
        error: undefined,
        changing: true,
      })
    })

    test('cancellation works', () => {
      const [store, actions] = createWeb3VueStoreAndActions()

      const cancelActivation = actions.startActivation()

      cancelActivation()

      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts: undefined,
        activating: false,
        error: undefined,
        changing: false,
      })
    })
  })

  describe('#update', () => {
    test('throws on bad chainIds', () => {
      const [, actions] = createWeb3VueStoreAndActions()
      for (const chainId of [1.1, 0, MAX_SAFE_CHAIN_ID + 1]) {
        expect(() => actions.update({ chainId })).toThrow(`Invalid chainId ${chainId}`)
      }
    })

    test('throws on bad accounts', () => {
      const [, actions] = createWeb3VueStoreAndActions()
      expect(() => actions.update({ accounts: ['0x000000000000000000000000000000000000000'] })).toThrow()
    })

    test('chainId', () => {
      const [store, actions] = createWeb3VueStoreAndActions()

      const chainId = 1
      actions.update({ chainId })
      expect(store.getState()).toEqual({
        chainId,
        accounts: undefined,
        activating: false,
        error: undefined,
        changing: false,
      })
    })

    describe('accounts', () => {
      test('empty', () => {
        const [store, actions] = createWeb3VueStoreAndActions()

        const accounts: string[] = []
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          activating: false,
          error: undefined,
          changing: false,
        })
      })

      test('single', () => {
        const [store, actions] = createWeb3VueStoreAndActions()

        const accounts = ['0x0000000000000000000000000000000000000000']
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          activating: false,
          error: undefined,
          changing: false,
        })
      })

      test('multiple', () => {
        const [store, actions] = createWeb3VueStoreAndActions()

        const accounts = ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001']
        actions.update({ accounts })
        expect(store.getState()).toEqual({
          chainId: undefined,
          accounts,
          activating: false,
          error: undefined,
          changing: false,
        })
      })
    })

    test('both', () => {
      const [store, actions] = createWeb3VueStoreAndActions()

      const chainId = 1
      const accounts: string[] = []
      actions.update({ chainId, accounts })
      expect(store.getState()).toEqual({
        chainId,
        accounts,
        activating: false,
        error: undefined,
        changing: false,
      })
    })

    test('chainId does not unset activating', () => {
      const [store, actions] = createWeb3VueStoreAndActions()
      const chainId = 1
      actions.startActivation()
      actions.update({ chainId })
      expect(store.getState()).toEqual({
        chainId,
        accounts: undefined,
        activating: true,
        error: undefined,
        changing: true,
      })
    })

    test('accounts does not unset activating', () => {
      const [store, actions] = createWeb3VueStoreAndActions()

      const accounts: string[] = []
      actions.startActivation()
      actions.update({ accounts })
      expect(store.getState()).toEqual({
        chainId: undefined,
        accounts,
        activating: true,
        error: undefined,
        changing: true,
      })
    })

    test('unsets activating', () => {
      const [store, actions] = createWeb3VueStoreAndActions()

      const chainId = 1
      const accounts: string[] = []
      actions.startActivation()
      actions.update({ chainId, accounts })
      expect(store.getState()).toEqual({
        chainId,
        accounts,
        activating: false,
        error: undefined,
        changing: true,
      })
    })
  })
})
