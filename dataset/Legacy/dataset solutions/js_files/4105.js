'use strict'
function otoshidama(stdin) {
  const inputs = stdin.split(' ')
  const n = inputs[0]
  const y = inputs[1]
  for (let i = 0;i <= n;i++) {
    const remain = y - 10000 * i
    if (remain === 0 && n === i) {
      return console.log(n, 0, 0)
    } else if (remain <= 0 && i < n) {
      break
    }
    for (let j = 0;j <= n - i;j++) {
      const sen = n - i - j
      const result = remain - 5000 * j - 1000 * sen
      if (result === 0) {
        return console.log(i, j, sen)
      } else if (result < 1000) {
        break
      }
    }
  }
  return console.log(-1, -1, -1)
}
otoshidama(require('fs').readFileSync(0, 'utf8'))