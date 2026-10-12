const main = stdin => {
  const input = stdin.trim().split('\n')
  const [A, B, C] = input[0].split(' ').map(x => parseInt(x))

  for (let i = A; i <= 10000; i += A) {
    if (i % B === C) {
      console.log('YES')
      return
    }
  }
  console.log('NO')
}


// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
