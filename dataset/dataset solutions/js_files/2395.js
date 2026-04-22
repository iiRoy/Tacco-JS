inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
N = inp.shift() * 1
b = {}
for (i=0; i<N; i++) {
    b[i] = {n: [], b: 0, u: {}, k: 0}
}
max = 0
for (i=0; i<N-1; i++) {
    l = inp[i].split(' ')
    j = l[0] - 1
    k = l[1] - 1
    b[j].n.push({ n: k, i: i })
    b[k].b += 1
    if (max < b[j].n.length + b[j].b) {
        max = b[j].n.length + b[j].b
    }
    if (max < b[k].n.length + b[k].b) {
        max = b[k].n.length + b[k].b
    }
}
a = []
for (i=0; i<N; i++) {
    for(j=0; j < b[i].n.length; j++) {
        o = b[i].n[j]
        f = false
        for (k = b[i].k + 1; k < max; k++) {
            if (!b[i].u[k]) {
                f = true
                break;
            }
        }
        if (!f) {
            for (k = 1; k < max; k++) {
                if (!b[i].u[k]) {
                    break;
                }
            }
        } 
        o.c = k
        b[i].u[o.c] = 1
        b[i].k = k
        b[o.n].u[o.c] = 1
        b[o.n].k = k
        a[o.i] = o.c
    }
}
console.log(max)
console.log(a.join("\n"))