"use strict";
function Main(input) {
    let cin = new Inputer(input);
    let q = cin.getInt();
    for (let i = 0; i < q; i++) {
        let a = cin.getInt(), b = cin.getInt();
        if (a == b) {
            console.log(2 * a - 2);
        } else if (a + 1 == b || b + 1 == a) {
            console.log(2 * Math.min(a, b) - 2);
        } else {
            let ab = a * b;
            let d = Math.floor(Math.sqrt(ab));
            if (d * d == ab) d--;
            if (d * (d + 1) >= ab) {
                console.log(2 * d - 2);
            } else {
                console.log(2 * d - 1);
            }
        }
    }
}
class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));