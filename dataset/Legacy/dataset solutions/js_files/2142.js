function parseInput(input) {
  const values = []
  input.split('\n').forEach(row => {
    const list = row.split(' ')
    list.forEach(v => values.push(v))
  })

  return values
}

function getInput() {
  const dummy = `1000000000 141421 173205`
  return parseInput(dummy || require('fs').readFileSync('/dev/stdin', 'utf8'))
}

function factorial(num) {
  var number = 1
  for (var i = 1; i <= num; i++) {
    console.log(number);
    number *= i
  }
  return number
}

function combination(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r))
}

;(function main() {
  const input = getInput()
  const n = +input[0]
  const a = +input[1]
  const b = +input[2]

  var sum = 0
  for (var r = 1; r <= n; r++) {
    if (r === a || r === b) {
      continue
    }

    sum += combination(n, r)
  }

  const c = Math.pow(10, 9) + 7
  console.log(sum % c)
})()
