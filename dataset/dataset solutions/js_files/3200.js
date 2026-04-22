'use strict'

const main = (INPUT) => {
  const N = Number(INPUT.split('\n')[0].split(' ')[0])
  const K = Number(INPUT.split('\n')[0].split(' ')[1])

  let cnt = 0
  for (let i = 1; i <= N; i += 2) {
    cnt++
  }
  if (cnt > K) {
    console.log('YES')
  } else {
    console.log('NO')
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
