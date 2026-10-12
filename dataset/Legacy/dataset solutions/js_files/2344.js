const main = stdin => {
  const input = stdin.trim().split('\n')
  const [A, B, C] = stdin.trim().split(' ').map(x => parseInt(x))
  A + B + C >= 22 ? console.log('bust') : console.log('win')
}

// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
