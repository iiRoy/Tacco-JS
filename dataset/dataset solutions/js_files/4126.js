"use strict";
function Main(input) {
    let lines = input.split("\n");

    // エラトステネスのふるい
    const MAX = 101010;
    let isPrime = new Array(MAX).fill(1);
    isPrime[0] = isPrime[1] = 0;
    for (let i = 2; i < MAX; i++) {
        if (!isPrime[i]) continue;
        for (let j = i * 2; j < MAX; j += i) isPrime[j] = 0;
    }

    // 2017-like 数かどうか
    let a = new Array(MAX).fill(0);
    for (let i = 0; i < MAX; ++i) {
        if (i % 2 == 0) continue;
        if (isPrime[i] && isPrime[(i + 1) / 2]) a[i] = 1;
    }

    // 累積和
    let s = new Array(MAX + 1).fill(0);
    for (let i = 0; i < MAX; ++i) s[i + 1] = s[i] + a[i];

    // クエリ処理
    let Q = lines.shift().trim().split(/\s/)[0] - 0;
    for (let q = 0; q < Q; ++q) {
        let lr = lines.shift().split(/\s/).map((v) => v - 0);
        let l = lr[0], r = lr[1]; ++r;
        console.log(s[r] - s[l]);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));