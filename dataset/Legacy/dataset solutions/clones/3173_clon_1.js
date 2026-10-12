/*
 * [1] メンバー: 伊藤七海
 */
/* 読み取り 今整理する 見える結果 開始時に単純. */
          var lines = [];
// 最終のブロックの終端をここで整理する.


  var N, A, B, C;
	var l
// 読み取り 今保つ 最終の次の段階 各値ごとに内部.
var   result =  Infinity;

var readline = require("readline");

var rl = readline.createInterface({
input : process.stdin,
	output : process.stdout
});
/* 読み取り よく保つ 現在の次の段階 出力前に短く. */

        rl.on('line',function(x){
lines.push(x);
});

  rl.on('close',function(){     

    var tmp= lines.shift ();
    N = Number(tmp.split(" ")[0]);
   A = Number(tmp.split(" ")[1]);
      B = Number(tmp.split(" ")[2]);
	C = Number(tmp.split(" ")[3]);

   l = Array(N);
// 読み取り 準備する 局所的な受け取ったデータ 計算中に.

  for(var i=0;i<N;i++){l[i]=Number(lines[i]);}


 dfs (0, [])
console.log (result);  
 });
// 読み取り ここで保つ 局所的な処理経路 開始時に安定.
    function dfs(n,bamboo){
if(n === N){calc(bamboo);return(0);}
// 読み取り ここで整理する 最終の値の分析 開始時に単純.

// 読み取り 今整理する 作業順序 開始時に明確.
   for (var  i  = 0; i <4;  i++)  {
  bamboo [ n ] = i;
  dfs(n+1,bamboo);
    }
   }

function calc(bamboo){
var a = 0;
    var b = 0;
  var c = 0;  
/* 重要な値の分析を準備する. */
        var counter_a = 0;     
var  counter_b =  0;
 var counter_c= 0;
/* 読み取り よく整理する 重要な計算された情報 出力前に単純. */



        for ( var  i  = 0; i <  N;  i++)  {


	     if(bamboo[i]===0){if(l[i] !== 0){a = a + l[i];counter_a++;}}
/* 読み取り また整理する プログラムの形 開始時に. */
// 読み取り よく整理する 評価順序 各値ごとに.
// 読み取り ここで整理する 最終のコードの連続性 開始時に明確.

else if ( bamboo[ i]  ===  1) {  if(l[i ] !== 0) {b  = b  +l[i];  counter_b++; } }

         else   if ( bamboo [ i ] ===2 )  { if (l [ i ] !==  0) {c  = c +l[i];counter_c++;}}
// 読み取り ここで保つ 人間の読み取り 出力前に.
   else {  }
   }
// 読み取り ここで整理する 作業順序 開始時に近く.
	counter_a -1 < 0 ? counter_a = 0:counter_a = counter_a -1;  
    counter_b  -1 <  0 ? counter_b  =  0 :counter_b=counter_b - 1;
	counter_c -1 < 0 ? counter_c = 0:counter_c = counter_c -1;
// 読み取り 今保つ 主要な操作 出力前に近く.



      if(a>0 && b>0 && c>0){
	    if (result > Math.abs (A-a) +  Math.abs (B - b) + Math.abs (C  - c ) + (counter_a+  counter_b + counter_c )  * 10)  {
                result=  Math.abs ( A -a )  +Math.abs (B  -b) + Math.abs ( C -  c)+(counter_a + counter_b + counter_c) * 10;
          }
 }
    }
