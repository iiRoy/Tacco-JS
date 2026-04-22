'use strict'

function main(input) {
  input = input
    .trim()
    .split(' ')
    .map(v => Number(v))
  const k = input[0]
  const s = input[1]
  let count = 0
  for (let xi = 0; xi <= k; xi++) {
    for (let yi = 0; yi <= k; yi++) {
      const tmp = s - (xi + yi)
      if (tmp >= 0 && tmp <= k) count++
    }
  }

  console.log(count)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
