'use strict'

function main(input) {
  let nums = input
    .split('')
    .map(v => ~~v)
    .slice(0, -1)
  let n = nums.length
  let blue = nums.reduce((a, c) => a + c)
  let red = n - blue

  console.log(Math.min(red, blue) * 2)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
