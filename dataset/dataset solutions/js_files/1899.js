var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
var [N, M] = input[0].split(' ').map(Number)
var H = input[1].split(' ').map(Number)
var isHighest = new Array(N).fill(true)

for (var i=0; i<M; i++) {
  var [A, B] = input[i+2].split(' ').map(v => Number(v-1))
  if (H[A] < H[B]) {
    isHighest[A] = false
  }
  else if (H[B] < H[A]) {
    isHighest[B] = false
  }
  else {
    isHighest[A] = isHighest[B] = false
  }
}
console.log(isHighest.filter(v => v).length)
