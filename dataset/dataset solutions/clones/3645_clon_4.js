"use strict";

function Main(source) {
    const pieces = source.split(/\n|\s/);
    const S = pieces[0];
    const n = S.length;

    const MOD = 1000000007n;
    const INV3 = 333333336n;

    let wild = 0;
    for (let i = 0; i < n; i++) {
        if (S[i] === '?') wild++;
    }

    const pow3 = new Array(wild + 1);
    pow3[0] = 1n;
    for (let i = 1; i <= wild; i++) {
        pow3[i] = (pow3[i - 1] * 3n) % MOD;
    }

    const suffixC = new Array(n + 1);
    suffixC[n] = 0n;
    for (let i = n - 1; i >= 0; i--) {
        let add = 0n;
        if (S[i] === 'C') add = 1n;
        else if (S[i] === '?') add = INV3;
        suffixC[i] = (suffixC[i + 1] + add) % MOD;
    }

    let answer = 0n;
    let prefixA = 0n;

    for (let i = 0; i < n; i++) {
        if (S[i] === 'B' || S[i] === '?') {
            const middleUsesWildcard = S[i] === '?' ? 1 : 0;
            let contribution = pow3[wild - middleUsesWildcard];
            contribution = (contribution * prefixA) % MOD;
            contribution = (contribution * suffixC[i + 1]) % MOD;
            answer = (answer + contribution) % MOD;
        }

        if (S[i] === 'A') {
            prefixA = (prefixA + 1n) % MOD;
        } else if (S[i] === '?') {
            prefixA = (prefixA + INV3) % MOD;
        }
    }

    console.log(answer.toString());
}

if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
