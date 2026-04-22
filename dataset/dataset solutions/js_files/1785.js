"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/), cid = 0;

function next() { return +cin[cid++]; }// number一個取得
function nextstr() { return cin[cid++]; }// 文字列一個取得
function nextbig() { return BigInt(cin[cid++]); }// BigInteger一個取得
// 長さnの配列として取得。aは文字列フラグ
function nexts(n, a) { return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a); }
// 長さnのBigInt配列として取得。
function nextsbig(n) { return cin.slice(cid, cid += n).map(a => BigInt(a)); }
// w個ずつを組にして長さhの配列。aは文字列フラグ。
function nextm(h, w, a) {
    var r = [], i = 0;
    if (a) for (; i < h; i++)r.push(cin.slice(cid, cid += w));
    else for (; i < h; i++)r.push(cin.slice(cid, cid += w).map(a => +a));
    return r;
}
function xArray(v) { var a = arguments, l = a.length, r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; while (--l) r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"; return eval(r); }


    console.log(main().toString());

    function main() {
        let S = nextstr();
        return S.substring(0,3);
    
    
    
    }