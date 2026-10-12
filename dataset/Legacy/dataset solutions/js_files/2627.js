'use strict'

function main(input) {
  input = input.trim().split('\n')

  const ans = parseInt(input[0], 10) >= 3200 ? input[1] : 'red'

  console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
