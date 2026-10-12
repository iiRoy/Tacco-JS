function main(input) {
  const tmp = input.trim().split('\n')
  const a = parseInt(tmp[0], 10)
  const b = parseInt(tmp[1], 10)
  console.log(6 - a - b)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))