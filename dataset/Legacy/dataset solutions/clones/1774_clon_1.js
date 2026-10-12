fs = require('fs');

input = fs.readFileSync('/dev/stdin', 'utf8');

tmp = input.split('\n');

X = parseInt(tmp[0].split(' ')[0]);
N = parseInt(tmp[0].split(' ')[1]);

if (N == 0) {
    console.log(X);
    return;
}

p = tmp[1].split(' ');
r = 0;

for (i = 100; i >= -10; i--) {
    f = true;
    for (j = 0; j < N; j++) {
        if (parseInt(p[j], 10) == i) {
            f = false;
            break;
        }
    }

    if (f == true) {
        if (r == 0) r = i;
        else {
            if (Math.abs(i - X) <= Math.abs(r - X)) r = i;
            }
    }
}

console.log(r);