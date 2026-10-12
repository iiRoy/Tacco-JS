'use strict'

const main = (INPUT) => {
  const input = INPUT.split('\n')
  const S = input[0]
  if (S.length === 2) {
    console.log(S)
  } else {
    console.log(S.split('').reverse().join(''))
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
