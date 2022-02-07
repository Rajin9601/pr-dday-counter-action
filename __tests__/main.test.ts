// import * as github from '@actions/github'
import {getLabelsToAddAndRemove} from '../src/dday-counter'

const countDownLabels = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5']

describe('getLabelsToAddAndRemove', () => {
  it('one label', () => {
    const pr = getPrForLabels('D1')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual(['D0'])
    expect(result.labelsToRemove).toEqual(['D1'])
  })

  it('multiple labels', () => {
    const pr = getPrForLabels('D1', 'D4')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual(['D0'])
    expect(result.labelsToRemove).toEqual(['D1', 'D4'])
  })

  it('no labels', () => {
    const pr = getPrForLabels('asf', 'test')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual([])
    expect(result.labelsToRemove).toEqual([])
  })

  it('D0 should not change', () => {
    const pr = getPrForLabels('D0')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual([])
    expect(result.labelsToRemove).toEqual([])
  })

  it('D0 should not change in multiple labels', () => {
    const pr = getPrForLabels('D0', 'D2')
    const result = getLabelsToAddAndRemove(pr, countDownLabels)
    expect(result.labelsToAdd).toEqual([])
    expect(result.labelsToRemove).toEqual(['D2'])
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
