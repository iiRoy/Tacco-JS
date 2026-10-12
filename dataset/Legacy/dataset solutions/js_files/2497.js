'use strict'
function main(inp) {
  inp = inp.trim().split('\n')
  const N = Number(inp.shift())
  inp = inp[0].split(' ').map(n => Number(n)).sort((a, b) => a - b)
  
  const check = (a, b, c) => {
    return (a+b > c) && (a+c > b) && (b+c > a)
  }

  let ans = 0
  for (let i = 0; i < N; i++) {
    for (let j = i+1; j < N; j++) {
      for (let k = j+1; k < N; k++) {
        if (inp[i] + inp[j] < inp[k]) break;
        if (check(inp[i], inp[j], inp[k])) {
          ans++
        }
      }
    }
  }
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
