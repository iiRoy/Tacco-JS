input = require('fs').readFileSync('/dev/stdin', 'utf8')
lines = input.split('\n')
line = lines.shift().split(' ')
N = line[0] * 1
e = []
e[1] =
Q = line[1] * 1
t = {}
n = []
a = []

for (i=1; i <= N; i++) {
    t[i] = []
    n[i] = 0
    a.push(0) 
}

for (i=0; i < N-1; i++) {
    line = lines[i].split(' ')
    t[line[0]].push(line[1]) 
    t[line[1]].push(line[0]) 
}

for (i=N-1; i < N + Q; i++) {
    line = lines[i].split(' ')
    n[line[0]] += line[1] * 1
}

h = []
c = 0
h.push([1, 0])
e = []
e[1] = 1
while(h.length) {
    s = h.pop()
    j = s[0]
    c = s[1]
    c += n[j]
    a[j-1] = c
    for (k=0; k<t[j].length; k++) {
        if (!e[t[j][k]]) {
            h.push([t[j][k], c])
            e[t[j][k]] = 1
        }
    }
}

console.log(a.join(' '))
