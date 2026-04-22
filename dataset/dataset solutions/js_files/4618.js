const main = input => {
  const [a, b, c] = input.trim().split(' ').map(s => s.charAt(0).toUpperCase())
  console.log(a + b + c)
}

// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
