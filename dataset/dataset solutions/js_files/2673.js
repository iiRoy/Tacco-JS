const Main = input => {
  input = input.split('\n')[0].split(' ').map(v => parseInt(v, 10))
  const n = input[2] - (input[0] - input[1])
  console.log(n < 0 ? 0 : n)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))