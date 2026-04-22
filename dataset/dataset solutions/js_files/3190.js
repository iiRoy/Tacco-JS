'use strict'

function main(input) {
  input = input
    .trim()
    .split('\n')
    .map(v => v.split(' ').map(Number))

  const N = input[0][0]
  const monsters = input[1].sort((a, b) => a - b)

  let tmp = Number.MAX_SAFE_INTEGER

  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b)
  }

  for (let i = 0; i < N - 1; i++) {
    const _ = gcd(monsters[i], monsters[i + 1])
    tmp = Math.min(_, tmp)
  }

  console.log(tmp)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
