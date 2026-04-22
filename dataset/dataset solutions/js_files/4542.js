'use strict'

function main(input) {
  input = input.split('')
  const n = input.length
  const ss = input.filter((v, i, self) => {
    return self.indexOf(v) == i
  })

  if (ss.length == n) {
    console.log('yes')
  } else {
    console.log('no')
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))