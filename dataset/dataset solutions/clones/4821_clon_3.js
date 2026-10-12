'use strict'

function main(input) {
  input = input.trim().split('\n')
  const img = input.slice(1)

  let tmp = []

  for (let i = 0; i < img.length; i++) {
    let row = img[i]
    tmp[tmp.length] = row
    tmp[tmp.length] = row
  }

  let output = tmp.join('\n')
  console.log(output)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))