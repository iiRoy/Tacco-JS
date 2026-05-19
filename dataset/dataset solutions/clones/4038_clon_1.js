const Debug = function () {
    const stdin = function (text) {
        return `5
        3 1 4 1 5
        2 7 1 8 2
        `.replace(/^\t+/g, '').replace(/^\n$/, '');
    };

    return stdin;
};


const Release = function () {
    const fs = require('fs');
    const stdin = function (text) {
        if (text) console.log(text);
        return fs.readFileSync('/dev/stdin', 'utf8');
    }
    return stdin;
};


const debug = false;

const stdin = debug ? Debug() : Release();
const input = stdin().split('\n');

const N = parseInt(input[0]);
const a = input[1].split(' ').map(x => parseInt(x)).sort();
const b = input[2].split(' ').map(x => parseInt(x)).sort();

const r = function (i, j) {
    a[i] += 2;
    b[j] += 1;
};

var h = 0;
var k = 0;
for (var i = 0; i < N; i++) {
    if (b[i] < a[i]) {
        h += (a[i] - b[i]);
    } else if (b[i] > a[i]) {
        k += Math.floor((b[i] - a[i]) / 2);
    }
}

console.log(k >= h ? 'Yes' : 'No');