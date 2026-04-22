inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
l = inp.shift().split(' ')
x1 = l.shift() * 1
y1 = l.shift() * 1
x2 = l.shift() * 1
y2 = l.shift() * 1
xd = x1 - x2
yd = y1 - y2
x3 = x2 + yd
y3 = y2 - xd
x4 = x1 + yd
y4 = y1 - xd
console.log('%d %d %d %d', x3, y3, x4, y4)