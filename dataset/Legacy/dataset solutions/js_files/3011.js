'use strict'
const gcd = (a, b) => Boolean(b) ? gcd(b, a % b) : a
const convertNum = num => Number(num)
const Main = input => {
  const count = Number(input[0])
  const nums = input[1].split(' ').map(convertNum)
  let result = 0
  for (let i = 0; i < count; i++ ) {
    let tmpResult = i === 0 ? nums[1] : nums[0]
    for (let n = 0; n < count; n++) {
      if (i !== n) {
        tmpResult = gcd(tmpResult, nums[n])
      }
    }
    result = result < tmpResult ? tmpResult : result
  }
  console.log(result)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/))