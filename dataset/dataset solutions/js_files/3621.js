const main = stdin => {
  const input = stdin.trim().split('\n')
  const N = parseInt(input[0])

  for (let i = 0; i <= 25; i++) {
    for (let j = 0; j <= 14; j++) {
      if (4 * i + 7 * j === N) {
        console.log('Yes');
        return
      }
    }
  }

  console.log('No')
}


// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
