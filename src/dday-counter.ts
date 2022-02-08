import * as core from '@actions/core'
import * as github from '@actions/github'

type ClientType = ReturnType<typeof github.getOctokit>
type PullRequest = {
  number: number
  labels: {name?: string}[]
}

type Result = {
  number: number
  prevDDay?: number
  nextDDay?: number
}

export async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', {required: true})
    const countDownLabels = core.getInput('dday-labels').split(',')
    const client: ClientType = github.getOctokit(token)
    const prList = await getPrList(client)

    const resultList: Result[] = []
    for (const pullRequest of prList) {
      const {labelsToAdd, labelsToRemove, prevDDay, nextDDay} =
        getLabelsToAddAndRemove(pullRequest, countDownLabels)
      const prNumber = pullRequest.number

      if (labelsToAdd.length > 0) {
        await addLabels(client, prNumber, labelsToAdd)
      }

      if (labelsToRemove.length > 0) {
        await removeLabels(client, prNumber, labelsToRemove)
      }

      resultList.push({number: prNumber, prevDDay, nextDDay})
    }
    core.setOutput('pull_requests', resultList)
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.error(error)
    core.setFailed(error.message)
  }
}

async function getPrList(client: ClientType): Promise<PullRequest[]> {
  let prList: PullRequest[] = []
  let page = 1
  const perPage = 80
  for (;;) {
    const {data: list} = await client.rest.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: 'open',
      per_page: perPage,
      page
    })
    prList = prList.concat(list)

    if (list.length !== perPage) break
    page += 1
  }
  return prList
}

export function getLabelsToAddAndRemove(
  pullRequest: PullRequest,
  countDownLabels: string[]
): {
  labelsToRemove: string[]
  labelsToAdd: string[]
  prevDDay: number | undefined
  nextDDay: number | undefined
} {
  let curDDay: number | undefined = undefined
  const labelsToRemove: string[] = []
  const labelsToAdd: string[] = []

  for (const label of pullRequest.labels) {
    const labelName = label.name
    if (labelName === undefined) {
      continue
    }
    const index = countDownLabels.indexOf(labelName)
    if (index >= 0) {
      if (curDDay !== undefined) {
        curDDay = Math.min(curDDay, index)
      } else {
        curDDay = index
      }
    }
    if (index > 0) {
      // D-0 should not be removed
      labelsToRemove.push(labelName)
    }
  }
  const nextDDay: number | undefined =
    curDDay !== undefined ? Math.max(curDDay - 1, 0) : undefined
  if (nextDDay !== undefined && nextDDay !== curDDay) {
    labelsToAdd.push(countDownLabels[nextDDay])
  }
  return {labelsToRemove, labelsToAdd, nextDDay, prevDDay: curDDay}
}

async function addLabels(
  client: ClientType,
  prNumber: number,
  labels: string[]
): Promise<void> {
  await client.rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels
  })
}

async function removeLabels(
  client: ClientType,
  prNumber: number,
  labels: string[]
): Promise<void> {
  await Promise.all(
    labels.map(async label =>
      client.rest.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: label
      })
    )
  )
}
