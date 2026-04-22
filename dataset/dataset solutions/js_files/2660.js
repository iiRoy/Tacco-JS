'use strict'

function main(input) {
  input = input
    .trim()
    .split(' ')
    .map(v => ~~v)
  const k = input[0]
  const x = input[1]

  if (k === 1) {
    console.log(x + '')
    return
  }

  let ans = []
  for (let i = x - (k - 1); i < x + k; i++) {
    ans.push(i)
  }
  console.log(ans.join(' '))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
