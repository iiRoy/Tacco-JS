const main = (input) => {
  const [a, b] = input.trim().split(' ')
  const ans = (BigInt(a)*BigInt(parseInt(b*100, 10))/100n).toString()

  return console.log(ans)
}

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))