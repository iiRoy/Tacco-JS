"use strict"

function main(input) {
  input = input.split('\n')
  const S = input[0]
  const K = parseInt(input[1], 10)

  let res = S.search(/[^1]+/)
  if (res >= 0 && res <= K - 1) console.log(S[res])
  else {
    console.log(1)
  }
}
main(require("fs").readFileSync("/dev/stdin", "utf8"))