'use strict'
let input = require("fs").readFileSync("/dev/stdin", "utf8");
input = input.trim();

// 正規表現は他の正解者のコードを参照
// ^は最初の1文字らしい
// アルファベットのあとに?をつけるとありでもなしでも通るようになる
let ans = input.match(/^A?KIHA?BA?RA?/) ? "YES" : "NO";
console.log(ans);

