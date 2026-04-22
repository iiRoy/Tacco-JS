"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let N = cin.getInt();
    let A = cin.getIntArray(N);
    const gcd = (a, b) => {
        return b ? gcd(b, a % b) : a;
    }
    let L = new Array(N+1); L[0] = 0;
    let R = new Array(N+1); R[N] = 0;
    for (let n = 0; n <= N; n++) {
        L[n+1] = gcd(L[n], A[n]);
    }
    for (let n = N-1; n >= 0; n--) {
        R[n] = gcd(R[n+1], A[n]);
    }
    let M = new Array(N);
    for (let n = 0; n < N; n++) {
        M[n] = gcd(L[n], R[n+1]);
    }
    console.log(Math.max(...M));
}
class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));