'use strict'

function castDigit(piece) {
  let value = ~~piece
  return value
}

function main(data) {
  let parts = data.split('')
  let converted = parts.map(v => {
    let current = castDigit(v)
    return current
  })
  let nums = converted.slice(0, -1)
  let n = nums.length
  let blue = nums.reduce((a, c) => {
    let sum = a + c
    return sum
  })
  let red = n - blue

  let smaller
  if (red < blue) {
    smaller = red
  } else {
    smaller = blue
  }

  let result = smaller * 2
  console.log(result)
}

let input = require('fs').readFileSync('/dev/stdin', 'utf8')
main(input)
