'use strict'

function main(input) {
  input = ~~input
  console.log(Math.ceil(input / 111) * 111)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
