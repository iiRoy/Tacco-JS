const main = (input) => {
  const s = BigInt(input.trim())

  for (let x=0n; x<100n; x++) {
    for (let y=0n; y<100n; y++) {
      if (x**5n - y**5n === s) {
        return console.log(`${x} ${y}`)
      } else if (x**5n + y**5n === s) {
        return console.log(`${x} ${-y}`)
      }
    }
  }
}

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
