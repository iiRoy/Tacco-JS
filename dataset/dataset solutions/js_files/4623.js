'use strict'

function main(input) {

  // 最大数が1e100なので、文字列として比較

  input = input.split('\n')
  const A = input[0]
  const B = input[1]

  const G = 'GREATER'
  const L = 'LESS'
  const E = 'EQUAL'

  //桁のチェック
  if (A === B) {
    console.log(E)
    return
  } else if (A.length > B.length) {
    consone.log(G)
    return
  } else if (A.length < B.length) {
    console.log(L)
    return
  } else {

    //桁は同じなので先頭の数字から比較
    for (let i = 0; i < A.length; i++) {
      let tmpA = Number(A[i])
      let tmpB = Number(B[i])
      if (tmpA > tmpB) {
        console.log(G)
        return
      } else if (tmpA < tmpB) {
        console.log(L)
        return
      }
    }
  }

}
main(require("fs").readFileSync("/dev/stdin", "utf8"));