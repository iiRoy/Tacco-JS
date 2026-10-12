const main = (input) => {
  const args = input.split(' ').map(v => Number(v))
  const n = args[0] + 1
  const k = args[1]
  const max = n - k + 1
  let sum = 0
  for (let i = 0; i < max; i++) {
    sum += max - i
  }
  console.log(sum % (10 ** 9 + 7))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))