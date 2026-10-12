'use strict'

const main = (INPUT) => {
  const N = Number(INPUT.split('\n')[0].split(' ')[0])
  const K = Number(INPUT.split('\n')[0].split(' ')[1])

  if ((N + 1) / 2 >= K) {
    console.log('YES')
  } else {
    console.log('NO')
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
