function main(input) {
  const [A, B] = input.split(' ')
  console.log(A * B)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
