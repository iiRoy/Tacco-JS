function main(input) {
  const tmp = input.trim().split('\n').map((n) => parseInt(n, 10))
  if (tmp[4] - tmp[0] <= tmp[5]) {
    console.log('Yay!')
  } else {
    console.log(':(')
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))