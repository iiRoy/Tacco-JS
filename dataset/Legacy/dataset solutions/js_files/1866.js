const main = stdin => {
  const [A, B, C, K] = stdin.trim().split(' ').reduce((acc, value) => {
    acc.push(parseInt(value))
    return acc
  }, [])

  if (A >= K) {
    console.log(K)
  } else if (B >= K - A) {
    console.log(A)
  } else {
    console.log(A - (K - A - B))
  }
}


// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
