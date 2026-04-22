'use strict'

const Main = (input) => {
  const N = parseInt(input.trim())

  let result = ':('

  for (let i = 1; i <= N; i++) {
    const tmp = Math.floor(i * 1.08)
    if (tmp === N) result = i
  }

  console.log(result)
  return result
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))