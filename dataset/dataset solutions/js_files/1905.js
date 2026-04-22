// k - i == Ai + Ak -->
// k - Ak == Ai + i

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const N = +lines[0];
const A = lines[1].split(' ').map(v => +v);

// console.log(`N=${N}`);
// console.log(A);

const map = {};

A.forEach((a, i) => {
    if (!map[a + i + 1]) {
        map[a + i + 1] = 1;
    } else {
        map[a + i + 1] ++;
    }
});

let count = 0;
A.forEach((a, k) => {
    if (map[k + 1 - a]) { // k - Ak = Ai + i
        count += map[k + 1 - a];
    }
});

// console.log(map);
console.log(count);
