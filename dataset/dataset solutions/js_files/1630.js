const main = (input) => {
  const [, s] = input.trim().split('\n')
  const str = Array.from(s)

  let wh = 0
  let rd = 0
  let change = 0

  let lastRed = str.length - 1

  for (let v of str) v === 'W' ? wh++ : rd++

  for (let i=0; i<lastRed; i++) {
    if (str[i] === 'W') {
      while (str[lastRed] === 'W') lastRed--
      if (i>=lastRed) break

      ;[str[i], str[lastRed]] = ['R', 'W']
      change++
      lastRed--
    }
  }
  
  return console.log(Math.min(change, Math.min(wh, rd)))
}

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))