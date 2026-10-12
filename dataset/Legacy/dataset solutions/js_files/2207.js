'use strict'

const effect = (H, a, b) => {
  if (a > H) a = H
  return H / a * b
}

function main(inp) {
  inp = inp.trim().split('\n')
  const HN = inp.shift().split(' ').map(n => Number(n))
  let H = HN[0]
  inp = inp.map(r => r.split(' ').map(n => Number(n)))

  let ans = 0

  while (H > 0) {
    const next = inp.sort((a, b) => effect(H, ...a) - effect(H, ...b))
    H -= next[0][0]
    ans += next[0][1]
  }

  console.log({ans})
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
