'use strict'

const main = INPUT => {
  const tmp = INPUT.split('\n').map(n => Number(n))
  tmp.shift()
  let input = tmp.sort((a, b) => b - a)
  let ans = input[0] / 2
  for (let i = 1; i < input.length; i++) {
    ans += input[i]
  }
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
