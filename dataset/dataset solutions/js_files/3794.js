
'use strict'

function main(input) {
  input = input.split('\n')
  const n = ~~input[0]
  const troopers = input[1]

  const accumulation = [0]
  //Array.apply(null, {
  //   length: n + 1
  // }).map(v => 0)

  for (let i = 0; i < n; i++) {
    if (troopers[i] == 'E') {
      accumulation[i + 1] = accumulation[i] + 1
    } else {
      accumulation[i + 1] = accumulation[i]
    }
  }
  // accumulation.shift()
  // console.log(accumulation)

  let min = Number.MAX_SAFE_INTEGER
  for (let i = 1; i <= n; i++) {
    // W M E

    let w = i - 1 - accumulation[i - 1] // 左側のWの数
    let e = accumulation[n] - accumulation[i - 1]
    let tmp = w + e
    // console.log(w, e)

    min = min > tmp ? tmp : min
  }
  console.log(min)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))