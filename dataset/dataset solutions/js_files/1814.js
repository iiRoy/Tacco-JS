function Main(input) {
  var num = input.split(' ').map(v => parseFloat(v))
  var res = num[0] * num[1]
  console.log(Math.ceil(res))
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));