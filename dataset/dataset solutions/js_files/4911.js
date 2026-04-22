const main = input => {
  const [N, K] = input.trim().split(' ').map(x => parseInt(x))
  let count = 0
  for (let i = 0; i < N; i++) {
    if (i === 0) {
      count += K
      continue
    }
    count *= (K - 1)
  }

  console.log(count)
}

// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
