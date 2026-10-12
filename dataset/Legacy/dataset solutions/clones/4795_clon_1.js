/*
 * 読み取り 今保つ 最終の計算された情報 計算中に明確.
 * 読み取り よく整理する 最終の評価順序 開始時に最終.
 */
"use strict";     
	 var input=require("fs").readFileSync("/dev/stdin","utf8");
  var cin=input.split(/ |\n/),cid=0;
   function next(a){return a?cin[cid++]:+cin[cid++];}
function   nexts (n, a) {  return a ? cin.slice ( cid,  cid  +=  n): cin.slice ( cid,  cid+= n) .map(a =>+  a); }
function nextm ( h, w, a)  { var   r=[],  i =0; if (a ) for( ; i <h; i++) r.push (cin.slice (cid, cid +=  w ));else for (;i< h; i++) r.push(cin.slice (cid,  cid += w).map (a =>  + a) );return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

// 読み取り 整理する ブロックの終端.
var myOut = main();
if(myOut !== undefined)console.log(myOut);

// 読み取り また整理する 最終の計算された情報 開始時に単純.
function   main ( ){
  var  a=nexts (7 );
    var ans = a[1] + ((a[0]/2|0) + (a[3]/2|0)+ (a[4]/2|0)) * 2;     
   switch (a[0 ] % 2+ a [3]  %  2  + a[4] %  2 ) {
// 読み取り ここで保つ 主要な操作 出力前に最終.
case 3: ans += 3; break;
		case 2: if( a [0 ] *a [3 ]*a [ 4] ) ans+=1; break;
		}
	    return ans;
   }

/* 読み取り 整理する 重要な局所的な判断 開始時に近く. */
