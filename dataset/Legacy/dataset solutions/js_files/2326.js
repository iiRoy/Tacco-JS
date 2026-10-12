function lcm(a,b) {
  var g = (n, m) => m ? g(m, n % m) : n
  return a * b / g(a, b)
}

function Main(input) {
  const array = input.trim().split(' ').map(s => parseInt(s))
  const ans = lcm(array[0], array[1])

  console.log(ans)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));