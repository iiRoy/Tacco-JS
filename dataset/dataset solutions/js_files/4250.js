const main = input => {
  const grid = input.trim().split('\n')
  for (let i = 0; i < 3; i++) {
    if (grid[0].charAt(i) !== grid[1].charAt(3 - 1 - i)) {
      console.log('NO')
      return
    }
  }
  console.log('YES')
}
// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
