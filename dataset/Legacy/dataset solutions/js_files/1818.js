"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.trim().split(/ |\n/), cid = 0;

console.log(main().toString());


function main() {
    var n = +cin.shift();
    var primes = make_primes(Math.sqrt(n));
    if (n == 1) return 0;
    if (n == 2) return 1;
    let ans = 0;
    let p = 2;
    for (let k = 0; p < n; k++) {
        p = primes[k];
        //        while (primes[primes.length - 1] < n) {
        //           primes.push(next_prime(primes, n));
        //      }
        //console.log({p, primes});
        let e = 0;
        while (n % p == 0) {
            e++;
            n = n / p;
        }
        if (e == 0) continue;
        // x=9 なら 1+2+3+4以下なので、3回割れる。 < 2 **4
        // x=10なら 1+2+3+4なので、4回割れる
        let i = 1;
        let sum = 1;
        while (sum + i + 1 <= e) {
            //console.log(sum, i, e);
            sum = sum + i + 1;
            i++;
        }
        ans = ans + i;
    }
    if (n > 1) ans++;

    return ans;
}

function make_primes(max) {
    let primes = [2, 3];
    let flg;
    for (let x = 5; x <= max; x += 2) {
        flg = 0;
        for (let j = 0; primes[j] * primes[j] <= x; j++) {
            if (x % primes[j] == 0) { flg = 1; break; }
        }
        if (flg == 0) { primes.push(x); }
    }
    return primes;
}

function next_prime(primes, max) {
    let flg;
    for (let x = primes[primes.length - 1] + 2; x <= max; x += 2) {
        flg = 0;
        for (let j = 0; primes[j] * primes[j] <= x; j++) {
            if (x % primes[j] == 0) { flg = 1; break; }
        }
        if (flg == 0) { primes.push(x); return x; }
    }
    return primes;
}

