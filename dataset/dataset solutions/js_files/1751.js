'use strict';

function Main(input) {
    // N
    // A1 A2 A3...An
    // Q
    // B1 C1
    // B2 C2
    // ...
    // BQ CQ
    let tmp = input.trim().split('\n');
    const N = Number(tmp[0]);
    let A = tmp[1]
        .split(' ')
        .sort((a, b) => a - b)
        .map((v) => BigInt(v));
    const Q = Number(tmp[2]);
    const BC = tmp.splice(3).map((v) => v.split(' ').map((v) => BigInt(v)));

    let arr = new Array(100001).fill(0n);
    for (const v of A) {
        arr[v] += 1n;
    }

    let result = arr.reduce((sum, v, i) => sum + v * BigInt(i));

    for (const [b, c] of BC) {
        const diff = (c - b) * arr[b];
        result += diff;
        console.log(String(result));
        arr[c] += arr[b];
        arr[b] = 0n;
    }

    return;
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));