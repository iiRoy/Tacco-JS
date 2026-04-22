function Main(stdin) {
  stdin = stdin.split('\n')
  const input = stdin[0].split('')
  var isChange = true
  var start = 0
  var count = 0
  while (isChange) {
    isChange = false
    for (var i = start; i < input.length; i++) {
      if (input[i] === 'A' && input[i + 1] === 'B' && input[i + 2] === 'C') {
        swap(input, i)
        count = count + 1
        isChange = true
      }
    }
    start = start + 2
  }
  console.log(count)
}

function swap(input, start) {
  input[start] = 'B'
  input[start + 1] = 'C'
  input[start + 2] = 'A'
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
