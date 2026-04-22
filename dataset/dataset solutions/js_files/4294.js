const main = input => {
  const [A, B, C] = input.trim().split(' ').map(x => parseInt(x))
  if (A === B) {
    console.log(C)
  } else {
    if (A === C) {
      console.log(B)
    } else {
      console.log(A)
    }
  }
}
// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
