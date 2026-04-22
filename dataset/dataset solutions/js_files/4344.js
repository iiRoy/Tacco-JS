const main = stdin => {
  const input = stdin.trim().split('\n')
  const N = parseInt(input[0])
  const A = parseInt(input[1])

  console.log(N * N - A)
}


// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
