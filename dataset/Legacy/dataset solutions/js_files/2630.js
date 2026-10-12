'use strict'

function Main(input) {
  const A = input.split("\n")[1].split(" ").map(x => Number(x))

  let mother = 0
  for(const a of A) {
    mother += 1/a
  }

  console.log(1/mother)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim())
