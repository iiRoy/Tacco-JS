"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let N = cin.getInt(), M = cin.getInt();
    let A = cin.getIntArray(N);
    let m = {};
    let SUM = new Array(N + 1);
    SUM[0] = 0;
    for (let i = 0; i < N; i++) {
        SUM[i + 1] = (SUM[i] + A[i]) % M;
    }
    let ans = 0;
    for (let i = 0; i < SUM.length; i++) {
        let sum = m[SUM[i]] || 0;
        ans += sum;
        m[SUM[i]] = sum + 1;
    }
    console.log(ans);
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
        let array = new Array(N);
        for (let n = 0; n < N; n++) array[n] = this.getInt();
        return array;
    }
    getStr() {
        return this.items[this.cnt++];
    }
    getStrArray(N) {
        let array = new Array(N);
        for (let n = 0; n < N; n++) array[n] = this.getStr();
        return array;
    }
}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));