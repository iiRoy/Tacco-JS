'use strict'

const main = (INPUT) => {
  const input = INPUT.split('\n').map(a => a.split(' '))
  let ary = [0, 0, 0, 0]
  for (let i = 0; i < input.length; i++) {
    ary[input[i][0] - 1]++
    ary[input[i][1] - 1]++
  }
  ary.sort((a, b) => a - b)
  if (ary[0] == 1 && ary[1] == 1 && ary[2] == 2 && ary[3] == 2) {
    console.log('YES')
  } else {
    console.log('NO')
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
