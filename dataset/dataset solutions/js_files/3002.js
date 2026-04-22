'use strict'

function Main(input) {
    let temp = input.trim().split(' ').map((v)=>parseInt(v));
    let a = temp.shift();
    let b = temp.shift();
    let t = temp.shift();

    let ans = Math.floor((t+0.5) / a)*b;

    console.log(ans);

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
