# PR D-Day Counter Action

Make D-Day label in pull requests down by one.

## Details

This github action detects labels in all PR in opened states, and change the label down-by-one.
For `D-0` label, it stays in the PR.

## Usage

```
name: 'D-Day Counter'
on: 
  schedule:
    - cron: '0 21 * * 0-4' # crontab (6:00 am mon-fri in Seoul timezone)

jobs:
  change-labels:
    runs-on: ubuntu-latest
    steps:
      - uses: rajin9601/pr-dday-counter-action@v1
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          dday-labels: "D-0,D-1,D-2,D-3,D-4" 
```

### Inputs

| Name | Description | Default | Required |
| - | - | - | - |
| `repo-token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret | N/A | true |
| `dday-labels` | D-Day labels as comma-seperated string in ascending order from 0 | N/A | true |

### Outputs

| Name | Description | format |
| - | - | - |
| `pull_requests` | Pull request lists | { number: number, prevDDay?: number, nextDDay?: number } |