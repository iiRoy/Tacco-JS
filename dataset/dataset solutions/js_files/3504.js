'use strict'

function main(input) {
  let ans = ''
  input = input.split('')
  for (let i in input) {
    ans += input[i] === '1' ? '9' : '1'
  }
  console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))