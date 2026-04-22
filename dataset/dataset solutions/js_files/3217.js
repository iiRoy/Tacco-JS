function Main(input) {
  const array = input.trim().split(' ')
  const T = parseInt(array[0])
  const X = parseInt(array[1])

  var ans = T / 3
  console.log(ans)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));