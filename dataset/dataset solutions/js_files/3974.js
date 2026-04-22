"use strict";
function lowerBound(a, v) {
    let l = 0, r = a.length - 1;
    while (r - l >= 0) {
        let c = Math.floor((l + r) / 2);
        if (v <= a[c]) {
            r = c - 1;
        } else {
            l = c + 1;
        }
    }
    return l;
}
function Main(input) {
    let cin = new Inputer(input);
    let N = cin.getInt(), A = cin.getIntArray(N), B = cin.getIntArray(N);
    let a = new Array(N), b = new Array(N);
    let ans = 0;
    for (let k = 0; k < 30; k++) {
        let count = 0;
        let mask = (1 << (k + 1)) - 1;
        for (let i = 0; i < N; i++) {
            a[i] = A[i] & mask;
            b[i] = B[i] & mask;
        }
        b.sort((a, b) => a - b);
        let T = 1 << k;
        for (let i = 0; i < N; i++) {
            let f1 = lowerBound(b, 1 * T - a[i]);
            let t1 = lowerBound(b, 2 * T - a[i]);
            let f2 = lowerBound(b, 3 * T - a[i]);
            let t2 = lowerBound(b, 4 * T - a[i]);
            count += t1 - f1;
            count %= 2;
            count += t2 - f2;
            count %= 2;
        }
        if (count == 1) {
            ans |= 1 << k;
        }
    }
    console.log(ans);
}
class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));