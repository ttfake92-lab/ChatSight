import { TimeDistribution } from './TimeDistribution'

describe('TimeDistribution', () => {
  it('should be defined', () => {
    expect(TimeDistribution).toBeDefined()
  })

  it('should be a function component', () => {
    expect(typeof TimeDistribution).toBe('function')
  })
})
