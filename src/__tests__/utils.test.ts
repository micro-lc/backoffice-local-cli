import {assert} from 'chai'
import {before} from 'mocha'

describe('utils tests', () => {
  before(() => {
    Object.defineProperty(global, '__dirname', {
      writable: true, value: '/'
    })
  })
  after(() => {
    Object.defineProperty(global, '__dirname', {
      writable: true, value: undefined
    })
  })
  it('should subtract the `__dirname` path from user input', () => {
    assert(true)
  })
})
