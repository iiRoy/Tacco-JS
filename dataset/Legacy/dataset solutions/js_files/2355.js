'use strict'
function main(inp) {
  const mod = 1e9 + 7
  inp = inp.trim().split('\n')
  const N = Number(inp.shift())
  inp = inp[0].split(' ').map(n => Number(n));

  let ans = 0
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      ans += inp[i] ^ inp[j] % mod
    }
  }
  console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));