const main = (input) => {
  const mod = 998244353n
  const [f, ...q] = input.trim().split('\n')
  const [n,] = f.split(' ').map(Number)

  const _s = {}
  for (let i=0; i<q.length; i++) {
    const [a, b] = q[i].split(' ').map(Number)

    for (let x=a; x<=b; x++) _s[x]++
  }

  const s = Array.from(Object.keys(_s)).sort((a, b) => a - b)

  const arr = new Array(n+1).fill(0n)
  arr[1] = 1n

  for (let i=1; i<n; i++) {
    if (arr[i] === 0n) continue

    for (let x=0; x<s.length; x++) {
      const p = Number(s[x])

      if (arr[i+p] !== undefined) arr[i+p] += arr[i]
      else break
    }
  }

  return console.log(`${(arr[n] % mod + mod) % mod}`)
}

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'))