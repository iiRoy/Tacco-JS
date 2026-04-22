"use strict"

function main(input) {
  input = input.split("")

  let ans = ""

  for (let i = 0; i < Math.ceil(input.length / 2); i++) {
    ans += input[i * 2]
  }
  console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"))
