
// 1
// 2
// 1 2
// 10
// //
// 1
// 2
// 1 1
// 10

function solve(n, x, A, S) {
  // console.log('n:', n, 'x:', x, 'a:', A[S.length - n], 's:', S[S.length - n])
  if (n === 0) return x === 0

  const s = S[S.length - n]
  if (s === '1') {
    // console.log('exec 1 do:')
    const r1 = solve(n - 1, x ^ A[S.length - n], A, S)
    // console.log('exec 1 rm:')
    const r2 = solve(n - 1, x, A, S)
    // console.log(r1, r2)
    return  r1 && r2
  } else {
    // console.log('exec 0:')
    return solve(n - 1, x ^ A[S.length - n], A, S) || solve(n - 1, x, A, S)
  }
}

function main(input) {
  const inputs = input.split('\n')
  const T = Number(inputs[0])
  for(let i = 0; i < T * 3; i+=3) {
    const N = inputs[i + 1]
    const A = inputs[i + 2].split(' ')
    const S = inputs[i + 3]
    const r = solve(N, 0, A, S)
    console.log(r ? '0' : '1')
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

