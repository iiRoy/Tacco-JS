function solve(n, x, A, S, dp) {
  // console.log('n:', n, 'x:', x, 'a:', A[S.length - n], 's:', S[S.length - n])
  if (n === 0) return x === 0
  const s = S[S.length - n]
  if (dp[n] !== undefined && dp[n][x] !== undefined) {
    // console.log('exists:', n, x, dp[n][x])
    return dp[n][x]
  }

  let r
  if (s === '1') {
    // console.log('exec 1 do:')
    r = solve(n - 1, x, A, S, dp) && solve(n - 1, x ^ A[S.length - n], A, S, dp)
    // console.log(r1, r2)
  } else {
    // console.log('exec 0 do:')
    r = solve(n - 1, x, A, S, dp) || solve(n - 1, x ^ A[S.length - n], A, S, dp)
  }
  if (dp[n] === undefined) {
    dp[n] = {}
  }
  // console.log(dp[n][x], n, x, r)
  dp[n][x] = r
  return r
}

function main(input) {
  const inputs = input.split('\n')
  const T = Number(inputs[0])
  for(let i = 0; i < T * 3; i+=3) {
    const N = inputs[i + 1]
    const A = inputs[i + 2].split(' ')
    const S = inputs[i + 3]
    const r = solve(N, 0, A, S, {})
    console.log(r ? '0' : '1')
  }
  // console.log('n:', count)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

