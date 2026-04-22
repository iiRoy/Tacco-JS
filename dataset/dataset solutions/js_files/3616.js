"use strict";
function Main(input) {
    let I = new Inputer(input);
    let N = I.getInt(), M = I.getInt(), Q = I.getInt();
    let T = new Array(N+1).fill(0).map(() => new Array(N+1).fill(0));
    for (let m = 0; m < M; m++) {
        let l = I.getInt(), r = I.getInt();
        T[l][r] += 1;
    }
    for (let p = 1; p <= N; p++) {
        for (let q = 1; q <= N; q++) {
            T[p][q] += (T[p - 1][q] + T[p][q - 1] - T[p - 1][q - 1]);
        }
    }
    for (let n = 0; n < Q; n++) {
        let p = I.getInt(), q = I.getInt();
        console.log(T[q][q] - T[p - 1][q]);
    }
}
class Inputer {
    constructor (input) {
        this.cnt = 0;
        this.items = input.split(/\n|\s/);
    }
    getInt() {
        return this.items[this.cnt++] - 0;
    }
    getIntArray(N) {
        let a = new Array(N);
        for (let n = 0; n < N; n++) a[n] = getInt();
        return a;
    }
    getStr() {
        return this.items[this.cnt++];
    }
    getStrArray(N) {
        let a = new Array(N);
        for (let n = 0; n < N; n++) a[n] = getStr();
        return a;
    }
}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));