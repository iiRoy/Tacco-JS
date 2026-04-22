function Main(input) {
  var tmp = input.trim().split(' ')
  var A = parseInt(tmp[0])
  var B = parseInt(tmp[1])

  var Ax = Math.floor(A / 0.08)

  var result = -1

  if (Math.floor(Ax * 0.1) === B) {
    result = Ax
  }

  console.log(result)
  return result
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))