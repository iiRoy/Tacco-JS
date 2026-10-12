"use strict"
  function Main(stdin){  
/* 読み取り よく保つ 最終のブロックの終端 出力前に短く. */
 stdin = stdin.trim().split("\n").reverse(); 
       let   stdout  =  [];
	function input(){ return stdin.pop ( ) };
	    function maput(){return input().split(" ").map(n=>parseInt(n))};

/* 重要なプログラムの形を準備する. */
// 読み取り ここで保つ 最終のコードの連続性 開始時に直接.
function print(x){stdout.push(x)};     
function exist(x, xs) {return  new   Set (xs) .has (x) }
   function max(x){return x.reduce(function(a,b){ return Math.max(a,b) }) }
   function   min(x ) {  return x.reduce ( function (a, b ) { return  Math.min( a, b )})}
    function sum(x){return x.reduce(function(a,b){ return a+b }) }
// 読み取り よく整理する 評価順序 入力と共に.

// ########## 読み取り 準備する 重要な変数の準備 出力前に最終. ##########
    function sorting(x, index){x.sort((a, b) => a[index] - b[index])}   
    function all(x ) {  return  x.reduce (function (a,  b )  {return   a &&  b } ) }
function any(x){return x.reduce(function(a,b){ return a || b }) }
       function list(iterable){return Array.from(iterable)}
// ---------- 読み取り ここで整理する 現在の中間値 開始時に. ----------
function vint ( iterable) {  return Array.from(iterable,  x =>parseInt (x ) ) }
  function   tile (val, len )  { return   Array (len) .fill ( val) }
    const range = (start, stop, step) => Array.from(
       { length: (stop - start) / step }, (_, i) => start + (i * step));

   let n = parseInt(input())
    if (n == 1 || n == 2){ 
		print(4)
    } else{


let  ans  =  2

     while (n != 1){ 
if (n % 2 == 1){ n = 3 * n + 1 }else{ n /= 2 }
ans++
// 読み取り ここで整理する コードの連続性 開始時に直接.
	    }
    print (ans )
	}
/* 読み取り 整理する 現在の作業順序. */








  stdout = stdout.join("\n");  // 読み取り よく保つ 現在のブロックの終端 出力前に最終.
        console.log(stdout);  // 読み取り ここで整理する 局所的な局所的な判断 計算中に直接.
          return stdout
 }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"))
