'use strict'

function main(input) {
  input = input.trim().split('\n')
  const N = Number(input[0])
  const nums = input[1].split(' ').map(v => parseInt(v, 10))
  let count = 0
  for (let i = 1; i < N - 1; i++) {
    if (
      (nums[i] < nums[i - 1] && nums[i] > nums[i + 1]) ||
      (nums[i] < nums[i + 1] && nums[i] > nums[i - 1])
    ) {
      count++
    }
  }
  console.log(count)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
