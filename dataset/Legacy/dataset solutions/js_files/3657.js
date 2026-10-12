var input = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n")
input = input[1].split(" ")

var max = 0
for (var i = 1;;i++) {
  var current = 0
  input.forEach((e) =>{
    current += i % Number(e)
  })

  if(current === 0) {
    break
  }

  if (max < current) {
    max = current
  }
}
console.log(max)