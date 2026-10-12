inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')
N = inp.shift() * 1
_dividers = function(n) {
  var arr = []
  for (var i = 1; i*i <= n; i++) {
     if (n % i === 0) {
       arr.push(i)
       if ( i != n / i) {
         arr.push(n / i)
       }
     }
  }
  return arr.sort((a, b) => a - b)
}
d = _dividers(N)
min = N.toString().length
for (i=0; i<d.length; i++) {
  b = d[i]
  a = N / b
  m = a > b ? a.toString().length : b.toString().length
  if (min > m) {
      min = m
  }
}
console.log(min)