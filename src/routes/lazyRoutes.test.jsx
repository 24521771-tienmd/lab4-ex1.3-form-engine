import { describe, expect, it } from 'vitest'
import { loadPersonDetail } from './lazyRoutes.js'

describe('lazyRoutes loaders', () => {
  it('loadPersonDetail resolves to a module whose default export is a component', async () => {
    expect(typeof loadPersonDetail).toBe('function')

    const module = await loadPersonDetail()
    expect(typeof module.default).toBe('function')
  })
})
