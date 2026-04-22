const median = l => l.sort()[Math.floor(l.length / 2)]

function Main(input) {
  input = input.split("\n")
  N = parseInt(input[0])
  a = input[1].split(" ")
  m = []

  for (let i = 0 ; i < N ; i++ ) {
    for (let j = i + 1 ; j < N + 1 ; j++ ) {
      m.push(median(a.slice(i, j)))
    }
  }
  console.log(median(m))
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
