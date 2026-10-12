'use strict'

const main = (INPUT) => {
  const input = INPUT.split('\n')
  const N = Number(input[0])
  input.shift()
  let tmp = input.filter((x, i, self) => self.indexOf(x) === i)
  if (tmp.length != N) {
    console.log('No')
    return
  } else {
    for (let i = 1; i < input.length; i++) {
      if (input[i - 1].slice(-1) != input[i].slice(0, 1)) {
        console.log('No')
        return
      }
    }
  }

  console.log('Yes')
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
