import * as core from '@actions/core';
import * as github from '@actions/github';

type ClientType = ReturnType<typeof github.getOctokit>;
type PullRequest = {
  number: number
  labels: { name?: string }[]
}

export async function run(): Promise<void> {
  try {
    const token = core.getInput("repo-token", { required: true })
    const countDownLabels = core.getInput("dday-labels").split(",")
    const client: ClientType = github.getOctokit(token)
    const prList = await getPrList(client)

    for (const pullRequest of prList) {
      const { labelsToAdd, labelsToRemove } = getLabelsToAddAndRemove(pullRequest, countDownLabels)
      const prNumber = pullRequest.number

      if (labelsToAdd.length > 0) {
        await addLabels(client, prNumber, labelsToAdd)
      }

      if (labelsToRemove.length > 0) {
        await removeLabels(client, prNumber, labelsToRemove)
      }
    }
  } catch (error: any) {
    core.error(error)
    core.setFailed(error.message)
  }
}

async function getPrList(client: ClientType): Promise<PullRequest[]> {
  let prList: PullRequest[] = []
  let page = 1
  const perPage = 80
  while (true) {
    const { data: list } = await client.rest.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: "open",
      per_page: perPage,
      page: page
    })
    prList = prList.concat(list)

    if (list.length != perPage) break
    page += 1
  }
  return prList
}

export function getLabelsToAddAndRemove(pullRequest: PullRequest, countDownLabels: string[]): { labelsToRemove: string[], labelsToAdd: string[] } {
  let currentDDay = countDownLabels.length
  const labelsToRemove: string[] = []
  const labelsToAdd: string[] = []

  for (const label of pullRequest.labels) {
    const labelName = label.name
    if (labelName == undefined) {
      continue
    }
    const index = countDownLabels.indexOf(labelName)
    if (index >= 0) {
      currentDDay = Math.min(currentDDay, index)
    }
    if (index > 0) { // D-0 should not be removed
      labelsToRemove.push(labelName)
    }
  }
  if (currentDDay >= 1 && currentDDay < countDownLabels.length) {
    labelsToAdd.push(countDownLabels[currentDDay - 1])
  }
  return { labelsToRemove, labelsToAdd }
}

async function addLabels(
  client: ClientType,
  prNumber: number,
  labels: string[]
) {
  await client.rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: labels,
  });
}

async function removeLabels(
  client: ClientType,
  prNumber: number,
  labels: string[]
) {
  await Promise.all(
    labels.map((label) =>
      client.rest.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: label,
      })
    )
  );
}
