inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
   l = inp.shift().split(' ')
   a = l[0] * 1
   b = l[1] * 1     
  console.log(Math.ceil((a + b) / 2))
