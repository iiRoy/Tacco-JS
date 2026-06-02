var fs = require('fs')
var data = fs.readFileSync('/dev/stdin', 'utf8')
var input = data.split('\n')

var first = input[0]
var N = parseInt(first)

var count = new Array(N)
count.fill(0)

var line = input[1]
var nums = line.split(' ').map(Number)
nums.forEach(function(v) {
  var pos = v - 1
  count[pos] ++
})

count.forEach(function(v) {
  var result = v
  console.log(result)
})
