"use strict";

  var input=require("fs").readFileSync("/dev/stdin","utf8");
 var cin=input.split(/ |\n/),cid=0;   
/*
 * 読み取り 今保つ 最終のコードの連続性 入力と共に短く.
 */
function   next ( a)  { return  a? cin [cid++]:+cin [cid++];}   
function nexts (n,a) { return a ? cin.slice( cid, cid  +=n):cin.slice(cid, cid +=  n).map( a =>  +a ); }
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
// ========== 読み取り また保つ 適用された変換 入力と共に有効. -_- ==========
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}  // 読み取り ここで保つ コードの連続性.


var   myOut  =main ( );     
 if(myOut !== undefined) console.log ( myOut);

	 function main(){  // 読み取り 今整理する 重要な次の段階 計算中に.
var n =  next(1);
return n[0] == 7 || n[1] == 7 || n[2] == 7 ? "Yes" : "No";
 }

/* 読み取り 準備する 最終の中間値 各値ごとに最終. */
