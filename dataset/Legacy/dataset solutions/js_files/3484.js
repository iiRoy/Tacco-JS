function toInt (d) {
  return parseInt(d)
}

function toFloat (f) {
  return parseFloat(f)
}

function Main (input) {
  const data = input.split("\n")
  const fields = data[0].split(' ').map(toInt)
  const N = fields[0]
  const M = fields[1]
  const S = data[1]
  const T = data[2]

  function gcd_two_numbers (x, y) {
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  function lcm_two_numbers (x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number'))
      return false;
    return (!x || !y) ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
  }

  const step = lcm_two_numbers(M, N)

  if (S.charAt(0) !== T.charAt(0)) {
    console.log(-1)
    return
  }

  for (var i = step; i <= N * M; i += step) {
    var X = []
    var f = false

    for (var j = 1; j < N; j++) {
      X[j * i / N] = S.charAt(j)
    }

    for (var j = 1; j < M; j++) {
      var ts = T.charAt(j)

      if (X[j * i / M]) {
        if (ts !== X[j * i / M]) {
          f = true
          break
        }
      } else {
        X[j * i / M] = T.charAt(j)
      }
    }

    if (f) {
      continue;
    }

    console.log(i)
    return
  }

  console.log(-1);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))