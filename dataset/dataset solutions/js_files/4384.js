"use strict"

function main(input) {
  input = input.split(/\s|\n/).map(v => ~~v)
  const nums = input.slice(1, input.length)
  let nums2 = []
  for (let i = 0; i < nums.length; i++) {
    nums2.push(nums[i] - 1)
    nums2.push(nums[i])
    nums2.push(nums[i] + 1)
  }
  const nums3 = nums2.sort((a, b) => a - b)
  let ans = 1
  let tmpcnt = 1
  let tmp = Number.MAX_SAFE_INTEGER
  for (let i = 0; i < nums3.length; i++) {
    if (tmp == nums3[i]) {
      tmpcnt++
    } else {
      tmp = nums3[i]
      tmpcnt = 1
    }
    ans = Math.max(tmpcnt, ans)
  }
  console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"))
