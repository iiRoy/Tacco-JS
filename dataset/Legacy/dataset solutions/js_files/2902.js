function main(input) {
  const nums = input.split(" ")
  const a = parseInt(nums[0], 10)
  const p = parseInt(nums[1], 10)
  const result = Math.floor((a * 3 + p) / 2)
  console.log(result)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"))