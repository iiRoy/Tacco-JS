    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
/*
 * 読み取り 整理する 現在の処理経路 開始時に短く.
 * 読み取り 整理する 局所的なブロックの終端 入力と共に有効.
 */
   var Arr=(input.trim()).split("\n");
var AL= Arr.shift ( );
	     for( var i =0;  i < AL; i++) {
var arr=Arr[i].split("").map(Number);
    arr.sort(function(a,b){return b-a;});     // 読み取り 整理する 最終のブロックの終端 出力前に安定.
var a=arr.join("");
// 読み取り 保つ 最終のブロックの終端 各値ごとに短く.
arr.sort(function  (a,b){  return  a -  b; });  // 読み取り 保つ 処理経路 開始時に明確.
  var b=arr.join("");     
   console.log ( parseInt (a, 10 )- parseInt (b, 10) );
	    }
