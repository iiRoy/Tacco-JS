'use strict'

function main(inp) {
  inp = inp.trim().split('\n')
  const NQ = inp.shift().split(' ').map(n => Number(n))
  let ab = {}
  for (let i = 1; i <= NQ[0]; i++) ab[i] = []
  let ans = new Array(NQ[0]+1).fill(0)

  for (let i = 0; i < inp.length; i++) {
    const arr = inp[i].split(' ').map(n => Number(n))
    let j = arr[0]
    if (i < NQ[0] - 1) {
      ab[j].push(arr[1])
    } else {
      ans[j] += arr[1]
    }
  }

  let queue = [1]
  const countup = n => {
    for (let i = 0; i < ab[n].length; i++) {
      let j = ab[n][i]
      ans[j] += ans[n]
      queue.push(j)
    }
  }
  while(queue.length) {
    countup(queue.shift())
  }
  ans.shift()

  console.log(ans.join(' '))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
