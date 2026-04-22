"use strict";
function Main(input) {
    let lines = input.split("\n");
    let nk = lines.shift().split(/\s/).map((v) => v - 0);
    let N = nk[0], K = nk[1];
    let S = lines.shift().split(/\s/)[0].split("").map((v) => v - 0);
    let n = 0, Z = [];
    let p, b = S[0];
    while (n < N) {
        for (p = n; p < N && S[p] == b; p++) { }
        if (p < N) {
            let l = p - n;
            Z.push({kind: b, pos: n, len: l});
            b = (b + 1) % 2;
        }
        n = p;
    }
    if (Z[0].kind == 0) Z.unshift({kind: 1, pos: 0, len: 0});
    let zs = Z.reduce((ac, v) => ac + (v.kind == 0 ? 1 : 0), 0);
    const f = (v) => {
        let result = Z[v].len;
        if (v > 0) result += Z[v - 1].len;
        if (v < Z.length - 1) result += Z[v + 1].len;
        return result;
    }
    let ans = 0;
    for (let n = 0; n <= K*2; n++) {
        ans += Z[n].len;
    }
    console.log(ans);
}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
