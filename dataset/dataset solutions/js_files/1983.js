const main = (input) => {
  const n = Number(input.trim())
  let ans = 0
  for (let i=1; i<=n; i++) if (i%3 && i%5) ans += i
  return console.log(ans)
}

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'))