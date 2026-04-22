const main = stdin => {
  const input = stdin.trim().split('\n')
  const [N, M, X] = input[0].split(' ').map(x => parseInt(x))
  const grid = Array(N + 1)
  const Ms = input[1].split(' ').map(x => parseInt(x))

  let leftCost = 0
  for (let i = X - 1; i > 0; i--) {
    if (Ms.includes(i)) {
      leftCost++
    }
  }

  let rightCost = 0
  for (let i = X; i < N; i++) {
    if (Ms.includes(i)) {
      rightCost++
    }
  }

  console.log(Math.min(leftCost, rightCost))
}


// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
