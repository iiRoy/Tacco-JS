inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
l = inp.shift().split(' ')
N = l[0] * 1
T = l[1] * 1
min = 1000
b = 0
for (i=0; i<N; i++) {
  l = inp[i].split(' ')
  c = l[0] * 1
  t = l[1] * 1
  if (T >= t) {
      if (min >= c) {
          min = c
          b = 1
      }
  }
}
console.log(b ? min : 'TLE')