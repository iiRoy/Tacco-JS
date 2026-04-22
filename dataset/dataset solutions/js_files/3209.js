"use strict";
function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};module.exports=I;

function main(input) {
  const o = new I(input);
  
  const L = o.a();

  const A = [];
  for (let i = 0; i < L ; i++) {
    A.push(o.a());
  }

  
  const dp = Array(L + 1).fill().map(() => Array(5).fill());
  dp[0] = [0, 0, 0, 0, 0];

  for (let i = 1; i <= L; i++) {
    let cur = A[i-1];
    let curEven = A[i-1] === 0 ? 2 : cur % 2;
    let curOdd = (cur + 1) % 2;

    dp[i][0] = dp[i-1][0] + cur;
    dp[i][1] = Math.min(dp[i-1][0], dp[i-1][1]) + curEven;
    dp[i][2] = Math.min(dp[i-1][0], dp[i-1][1], dp[i-1][2]) + curOdd;
    dp[i][3] = Math.min(dp[i-1][2], dp[i-1][3]) + curEven;
    dp[i][4] = Math.min(dp[i-1][0], dp[i-1][1], dp[i-1][2], dp[i-1][3], dp[i-1][4]) + cur;
  }

  console.log(Math.min(...dp[L]));
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));
