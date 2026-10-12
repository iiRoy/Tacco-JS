'use strict'

const main = (INPUT) => {
  let input = INPUT.split('\n')
  const K = Number(input[0].split(' ')[1])
  input.shift()
  input = input.sort((a, b) => a - b).map(n => Number(n))
  let ans = 9999
  for (let i = 0; i <= input.length - K; i++) {
    let min = Number(input[i])
    let max = Number(input[i + K - 1])
    let tmp = max - min
    if (ans > tmp) {
      ans = tmp
    }
  }
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
