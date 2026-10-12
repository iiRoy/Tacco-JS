
'use strict'
function F(x) {
  let s = 0
  let y = x
  while (y > 0) {
    s += y % 10
    y /= 10
  }
  return x / s
}
function Main(input) {
  input = input.split("\n")
  let line1 = input[0].split(' ')
  let K = parseInt(line1[0])
  console.log(1)
  let x = 2
  for (let i = 1; i < K; i += 1) {
    let z = x, y = x
    let fm = F(z)
    for (let d = 1; d <= x; d *= 10) {
      y = y + (9 - (y / d) % 10) * d
      let fy = F(y)
      if (fy < fm) {
        z = y
        fm = fy
      }
    }
    console.log(z)
    x = z + 1
  }
  return 0
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"))