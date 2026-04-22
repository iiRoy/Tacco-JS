"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let N = cin.getInt();
    let R = new Array(N);
    let B = new Array(N);
    for (let r = 0; r < N; r++) R[r] = [cin.getInt(), cin.getInt()];
    for (let b = 0; b < N; b++) B[b] = [cin.getInt(), cin.getInt()];
    const sortFunc = (a, b) => a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
    R.sort(sortFunc);
    B.sort(sortFunc);
    let ans = 0;
    for (let r = 0; r < N; r++) {
        if (R[r] == undefined) continue;
        for (let b = 0; b < N; b++) {
            if (B[b] == undefined) continue;
            if (R[r][0] < B[b][0] && R[r][1] < B[b][1]) {
                B[b] = undefined;
                R[r] = undefined;
                ans++;
                break;
            }
        }
    }
    console.log(ans);
}
class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));