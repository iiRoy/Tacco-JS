"use strict";

function solve(data) {
    const rows = data.split("\n");
    const LIMIT = 101010;
    const memo = new Map();

    function prime(n) {
        if (memo.has(n)) return memo.get(n);
        let ok = true;
        if (n < 2) {
            ok = false;
        } else if (n !== 2 && n % 2 === 0) {
            ok = false;
        } else {
            let d = 3;
            while (d * d <= n) {
                if (n % d === 0) {
                    ok = false;
                    break;
                }
                d += 2;
            }
        }
        memo.set(n, ok);
        return ok;
    }

    const liked = [];
    let value = 1;
    while (value < LIMIT) {
        if (prime(value) && prime((value + 1) / 2)) liked.push(value);
        value += 2;
    }

    function firstNotLess(x) {
        let left = 0;
        let right = liked.length;
        while (left < right) {
            const mid = (left + right) >> 1;
            if (liked[mid] < x) left = mid + 1;
            else right = mid;
        }
        return left;
    }

    let queries = rows.shift().trim().split(/\s/)[0] - 0;
    for (let idx = 0; idx < queries; ++idx) {
        const pair = rows.shift().split(/\s/).map((part) => part - 0);
        const low = pair[0];
        let high = pair[1];
        ++high;

        let answer;
        if (Number.isInteger(low) && Number.isInteger(high) && low >= 0 && high >= 0 && low <= LIMIT && high <= LIMIT) {
            answer = firstNotLess(high) - firstNotLess(low);
        } else {
            answer = NaN;
        }
        console.log(answer);
    }
}

solve(require("fs").readFileSync("/dev/stdin", "utf8"));
