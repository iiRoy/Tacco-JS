const main = input => {
  const a = Number(input.trim())
  return a + a ** 2 + a ** 3
}

console.log(main(require('fs').readFileSync('/dev/stdin', 'utf8')))