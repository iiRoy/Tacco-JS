"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let N = cin.getInt(), S = cin.getStr(), K = cin.getInt();
    let ans = [], Ch = S.charAt(K-1);
    for (let n = 0; n < N; n++) {
        ans.push(Ch == S.charAt(n) ? Ch : "*");
    }
    console.log(ans.join(''));
}
class Inputer{constructor(t){this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));