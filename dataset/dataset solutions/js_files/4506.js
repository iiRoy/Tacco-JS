'use strict'

function main(input) {
  input = input.split('\n').map(v => ~~v)
  const n = input[0]
  const buttons = input.slice(0, input.length)
  let tmp = 1
  let next = 0
  let cnt = 1

  while (cnt < n) {
    next = buttons[tmp] // index 3
    if (next == 2) {
      console.log(cnt)
      return
    }
    tmp = next
    cnt++
  }
  console.log(-1)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
