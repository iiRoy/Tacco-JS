'use strict'

function main(input) {
  input = input
    .trim()
    .split(' ')
    .map(v => Number(v))

  const ans = input[0] < input[1] ? 0 : 10
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
