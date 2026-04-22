'use strict'

const main = (INPUT) => {
  const input = INPUT.split('\n')[0].split(' ').map(n => Number(n))
  const A = input[0]
  const B = input[1]
  const C = input[2]
  let ans
  if (C <= A + B) {
    ans = C + B
  } else {
    ans = (C + B) - (C - B - A) + 1
  }
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
