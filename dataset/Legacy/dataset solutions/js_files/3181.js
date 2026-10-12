const main = stdin => {
  const input = stdin.trim().split('\n')
  const [A, B] = input[0].split(' ').map(x => parseInt(x))

  if (B % A === 0) {
    console.log(A + B)
  } else {
    console.log(B - A)
  }
}
// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
