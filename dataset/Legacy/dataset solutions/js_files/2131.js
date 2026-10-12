function parseInput(input) {
  const values = []
  input.split('\n').forEach(row => {
    const list = row.split(' ')
    list.forEach(v => values.push(v))
  })

  return values
}

function getInput() {
  return parseInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
}
(function main() {
  const input = getInput()
  const N = +input[0]
  const R = +input[1]

  const res = R + 100 * (10 - N)
  console.log(res)
})()

