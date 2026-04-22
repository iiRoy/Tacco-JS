"use strict"

function main(input) {
  const sq = input.split(/\n|\s/).map(v => ~~v)

  const x = sq[2] - sq[0] //x distance
  const y = sq[3] - sq[1]

  const x3 = sq[2] - y
  const y3 = sq[3] + x
  const x4 = sq[0] - y
  const y4 = sq[1] + x

  console.log(x3, y3, x4, y4)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"))
