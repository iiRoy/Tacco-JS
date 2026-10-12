"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/),
    cid = 0;

// number一個取得
// eslint-disable-next-line no-unused-vars
const next = () => +cin[cid++];

// 文字列一個取得
// eslint-disable-next-line no-unused-vars
const nextstr = () => cin[cid++];

// BigInteger一個取得
// eslint-disable-next-line no-unused-vars
const nextbig = () => BigInt(cin[cid++]);

// 長さnの配列として取得。aは文字列フラグ
// eslint-disable-next-line no-unused-vars
const nexts = (n, a) =>
    a ? cin.slice(cid, (cid += n)) : cin.slice(cid, (cid += n)).map((a) => +a);

// w個ずつを組にして長さhの配列。aは文字列フラグ。
// eslint-disable-next-line no-unused-vars
const nextm = (h, w, a) => {
    var r = [],
        i = 0;
    if (a) for (; i < h; i++) r.push(cin.slice(cid, (cid += w)));
    else for (; i < h; i++) r.push(cin.slice(cid, (cid += w)).map((a) => +a));
    return r;
};
// 多次元配列。v,a1,a2,a3 なら、3次元。[[値vで長さa3の配列]をa2個並べた配列]をa1個並べた配列。
// eslint-disable-next-line no-unused-vars
const xArray = (...args) => {
    var a = args,
        l = a.length,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + a[0] + ";})";
    while (--l) r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    return eval(r);
};

console.log(main().toString());

function main() {
    let N = next();
    let M = next();
    let K = xArray(0, M);
    let S = xArray(0, N, M);
    for (let i = 0; i < M; i++) {
        K[i] = next();
        S[i] = nexts(K[i]).map((v) => v - 1);
    }
    let P = nexts(M);

    let ans = 0;
    let pat_bits = Array(N);
    for (let pat = 0; pat < 2 ** N; pat++) {
        // 2進数n-bit目をswitchのon/offに対応させる。
        // S[i]のnビット目をチェックすることに等しい。
        for (let n = 0; n < N; n++) {
            pat_bits[n] = (pat >> n) % 2;
        }
        let flag = true;
        //console.log("Pattern=", pat_bits);
        for (let i = 0; i < M; i++) {
            //console.log("denkyu:" + i, "switch=" + S[i], "正解=", P[i]);
            let value = 0;
            for (let n = 0; n < K[i]; n++) {
                value += pat_bits[S[i][n]];
            }
            if (value % 2 != P[i]) {
                //console.log("Value=" + value, "FAIL");
                flag = false;
                break;
            }
            //console.log("Value=" + value, "accept!");
        }
        if (flag) {
            ans++;
        }
    }
    return ans;
}
