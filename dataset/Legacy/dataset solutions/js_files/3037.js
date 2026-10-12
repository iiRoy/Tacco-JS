'use strict'
function main(input) {
  let result = input.trim().split('\n')[1].match(/(\#+\.+)+/)
  const white = result ? result[0].match(/\./g).length : 0
  const black = result ? result[0].length - white : 0
  console.log(Math.min(white, black))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
