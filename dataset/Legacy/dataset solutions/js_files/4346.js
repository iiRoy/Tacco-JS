"use strict"

function main(input) {
  //
  input = input.split(/\n/).map(v => v.split(" ").map(v => ~~v))
  const N = input[0][0]
  const K = input[1][0]
  const balls = input[2]
  let ans = 0

  for (let i = 0; i < N; i++) {
    ans += balls[i] < Math.abs(balls[i] - K) ? balls[i] : Math.abs(balls[i] - K)
  }
  ans *= 2

  console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"))
