'use strict'


function Main(input) {
  const s = input.trim().split('')
  const N = s.length - 1
  
  var answer = 0
  for (let bit = 0; bit < (1 << N); bit++) {
    let tmpStrs = [s[0]]
    for (let i = 0; i < N; i++) {
        const num = s[i + 1]
        if (bit & (1 << i)) {
            tmpStrs.push(num)
        } else {
            tmpStrs[tmpStrs.length - 1] += num
        }
    }
    answer += tmpStrs.reduce((p, c) => p + parseInt(c), 0) // 文字列を数に変換するので、初期値の0を渡す
  }

  console.log(answer)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));