const main = (input) => {
  const a = '0abcdefghijklmnopqrstuvwxyz'
  let N = BigInt(input.trim())

  const ans = []
  while (N > 0n) {
    const r = Number(N % 26n)
    ans.unshift(a[r])
    N = (N - BigInt(r)) / 26n
  }
  // if (N > 0n) ans.unshift(a[Number(N)])
  return console.log(ans.join(''))
}

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))