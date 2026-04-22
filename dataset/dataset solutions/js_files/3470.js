function toInt(d) {
  return parseInt(d)
}

function Main(input) {
  const data = input.split("\n")
  const field = data[0].split(' ').map(toInt)
  const A = field[0]
  const B = field[1]
  const K = field[2]

  var a = A
  var b = B

  var t = 'a'

  for (var i = 0; i < K; i++) {
    if (t === 'a') {
      if (a % 2 !== 0) {
        a--;
      }

      var pa = a / 2

      a = a - pa
      b = b + pa
      t = 'b'
    } else {
      if (b % 2 !== 0) {
        b--;
      }

      var pb = b / 2

      a = a + pb
      b = b - pb
      t = 'a'
    }
  }

  console.log(a + ' ' + b)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))