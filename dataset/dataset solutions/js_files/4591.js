'use strict'

const Main = (input) => {
  const tmp = input.trim().split(' ')
  let A = parseInt(tmp[0])
  let B = parseInt(tmp[1])
  let C = parseInt(tmp[2])

  let result = 0

  if (A === B && B === C && A % 2 === 0) {
    result = -1
  } else {
    for (let i = 1; A % 2 === 0 && B % 2 === 0 && C % 2 === 0; i++) {
      const Arr = [A, B, C]
      A = Arr[1] / 2 + Arr[2] / 2
      B = Arr[0] / 2 + Arr[2] / 2
      C = Arr[0] / 2 + Arr[1] / 2
      result = i
    }
  }

  console.log(result)
  return result
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))