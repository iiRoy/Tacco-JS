const main = stdin => {
  const input = stdin.trim().split('\n')
  const [A, B] = input[0].split(' ')
  const S = input[1]
  const pattern = new RegExp('\\d{' + A + '}' + '-' + '\\d{' + B + '}', 'g')

  if (S.match(pattern)) {
    console.log('Yes')
  } else {
    console.log('No')
  }
}


// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
