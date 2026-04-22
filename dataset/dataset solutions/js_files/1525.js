"use strict";
function Main(input) {
    input = input.trim().split("\n");
 
    //文字列から10進数に変換するときはparseIntを使います
    const arr = input[0].split(" ",4);
    let a = arr[0];
    let b = arr[1];
    let c = arr[2];
    let d = arr[3];
 
    let ary = [];
    const aryMax = function (a, b) {return Math.max(a, b);}
  
    ary.push(a*c);
    //console.log(ary);
    ary.push(a*d);
    //console.log(ary);
    ary.push(b*c);
    //console.log(ary);
    ary.push(b*d);
    //console.log(ary);
    //let res = Math.max.apply(null, ary);
    let  res = ary.reduce(aryMax);
    //出力
    console.log( res );
  
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
