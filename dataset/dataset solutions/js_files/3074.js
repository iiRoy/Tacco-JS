// 解法#2

'use strict'
function main(input) {
  input = input.trim().split('\n')
  const counts = input.shift().split(' ')
  input = input.map(val => val.split(' '))

  let result = []

  input.map(items => items.sort((a, b) => Number(b) - Number(a)))

  for (let i = 0; i < counts[0]; i++) {
    for (let j = 0; j < counts[1]; j++) {
      for (let k = 0; k < counts[2]; k++) {
        if ((i + 1) * (j + 1) * (k + 1) <= 3000) {
          result.push(Number(input[0][i]) + Number(input[1][j]) + Number(input[2][k]))
        } else {
          break
        }
      }
    }
  }
  result = result.sort((a, b) => b - a).slice(0, counts[3])

  console.log(result.join('\n'))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
