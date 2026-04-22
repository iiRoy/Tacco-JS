'use strict';
const fs = require('fs');

let fac = [];
let inv = [];
let finv = [];

function initFactorialMod(n, mod) {
    fac[0] = fac[1] = 1;
    finv[0] = finv[1] = 1;
    inv[1] = 1;
    for(let i = 2; i <= n; i++) {
        inv[i] = mod - inv[mod % i] * (mod / i) % mod;
        fac[i] = fac[i - 1] * i % mod;
        finv[i] = finv[i - 1] * inv[i] % mod;
    }
}

function combinationMod(n, k, mod) {
    if(n < k) return 0;
    if(n < 0 || k < 0) return 0;
    return fac[n] * (finv[k] * finv[n - k] % mod)) % mod;
}

function solve(x, y, mod) {
    if((x + y) % 3 > 0) {
        return 0;
    }
    let n = (2 * y - x) / 3;
    let m = (2 * x - y) / 3;
    if(n < 0 || m < 0) {
        return 0;
    }
    const M = 10e9 + 7;
    initFactorialMod(n + m, M);
    return combinationMod(n + m, n, M);
}

function main(arg) {
    const args = arg.split(/\s/);
    let X = parseInt(args[0], 10);
    let Y = parseInt(args[1], 10);
    console.log(solve(X, Y));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
