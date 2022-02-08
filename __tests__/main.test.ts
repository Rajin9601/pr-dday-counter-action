// import * as github from '@actions/github'
import {getLabelsToAddAndRemove} from '../src/dday-counter'

const countDownLabels = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5']

describe('getLabelsToAddAndRemove', () => {
  it('one label', () => {
    const pr = getPrForLabels('D1')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual(['D0'])
    expect(result.labelsToRemove).toEqual(['D1'])
    expect(result.nextDDay).toEqual(0)
    expect(result.prevDDay).toEqual(1)
  })

  it('multiple labels', () => {
    const pr = getPrForLabels('D1', 'D4')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual(['D0'])
    expect(result.labelsToRemove).toEqual(['D1', 'D4'])
    expect(result.nextDDay).toEqual(0)
    expect(result.prevDDay).toEqual(1)
  })

  it('no labels', () => {
    const pr = getPrForLabels('asf', 'test')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual([])
    expect(result.labelsToRemove).toEqual([])
    expect(result.nextDDay).toEqual(undefined)
    expect(result.prevDDay).toEqual(undefined)
  })

  it('D0 should not change', () => {
    const pr = getPrForLabels('D0')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual([])
    expect(result.labelsToRemove).toEqual([])
    expect(result.nextDDay).toEqual(0)
    expect(result.prevDDay).toEqual(0)
  })

  it('D0 should not change in multiple labels', () => {
    const pr = getPrForLabels('D0', 'D2')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual([])
    expect(result.labelsToRemove).toEqual(['D2'])
    expect(result.nextDDay).toEqual(0)
    expect(result.prevDDay).toEqual(0)
  })
})

function getPrForLabels(...labels: string[]) {
  return {
    number: 1,
    labels: labels.map(x => {
      return {name: x}
    })
  }
}
