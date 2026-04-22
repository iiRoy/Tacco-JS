"use strict"
let input = require("fs").readFileSync("/dev/stdin","utf-8");
input = input.split("\n");

let peopleLine = input[1]

let changeNum = 0; // 向きを変える人数
// 左端の人がリーダーの場合の向きを変える人数を数える
for(let i = 1; i < peopleLine.length; i++){
    changeNum += peopleLine[i] == "E" ? 1 : 0;
}
let minChangeNum = changeNum;

// 1つずつずらしてみて、向きを変える人数をそれぞれ計算する
for(let i = 1; i < peopleLine.length; i++){
    changeNum += peopleLine[i - 1] == "W" ? 1 : 0;
    changeNum -= peopleLine[i] == "E" ? 1 : 0;
    minChangeNum = Math.min(minChangeNum, changeNum);
}
console.log(minChangeNum);