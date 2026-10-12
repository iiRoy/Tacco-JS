'use strict'

const main = (INPUT) => {
  const S = INPUT.split('\n')[0]
  const str = 'keyence'
  let ans = 'YES'
  let j = 0
  let tmp = -1
  let i = 0
  for (; i < S.length; i++) {
    if (S[i] == str[j]) {
      j++
    } else {
      if (tmp != -1 && tmp + 1 != i) {
        i = 0
        break
      }
      tmp = i
    }
  }
  if (j != str.length || i != S.length) {
    ans = 'NO'
  }
  console.log(ans)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
