'use strict'
function main(input) {
  input = input.trim().split(' ')
  const r = Number(input[0])
  const D = Number(input[1])
  let ans = [Number(input[2])]

  for (let i = 1; i <= 10; i++) {
    ans[i] = r * ans[i - 1] - D
  }

  ans.shift()
  console.log(ans.join('\n'))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
