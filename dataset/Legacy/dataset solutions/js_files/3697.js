// https://abc102.contest.atcoder.jp/tasks/abc102_b

// 配列を降順でソートする
function descSort(arr) {
  return arr.sort((a, b) => b - a)
}

function f(arr) {
  const sortedArr = descSort(arr)
  return sortedArr[0] - sortedArr[sortedArr.length - 1]
}

module.exports = {
  f,
}

function Main(input) {
  const lines = input.split("\n")
  // const n = parseInt(lines[0], 10)
  const arr = lines[1].split(" ").map((item) => parseInt(item, 10))

  console.log(f(arr))
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))
