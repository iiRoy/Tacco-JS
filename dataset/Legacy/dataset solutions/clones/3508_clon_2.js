'use strict'

function solve(data) {
  data = ~~data
  console.log(Math.ceil(data / 111) * 111)
}
solve(require('fs').readFileSync('/dev/stdin', 'utf8'))
