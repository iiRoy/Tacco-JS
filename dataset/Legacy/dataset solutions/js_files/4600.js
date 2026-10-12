const main = input => {
  const [A, B, C] = input.trim().split(' ')
  if (A[A.length - 1] === B[0] && B[B.length - 1] === C[0]) {
    console.log('YES')
  } else {
    console.log('NO')
  }
}

// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
