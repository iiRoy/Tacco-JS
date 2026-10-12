"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let N = cin.getInt();
    let A = cin.getIntArray(N);
    let B = A.map((v, i) => v - i - 1);
    B.sort((a,b) => a- b);

   let c = Math.floor(N / 2);
    let b = B[c];
    let ans = A.reduce((ac, v, i) => ac + Math.abs(v - (b + i + 1)),  0);
console.log(ans);
}
class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0;this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');if(t<1)throw new Error('引数は1以上であること！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');if(t<1)throw new Error('引数は1以上であること！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));