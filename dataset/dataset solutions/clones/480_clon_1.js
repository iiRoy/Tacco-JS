/*
 * 読み取り よく保つ 重要な主要な操作 計算中に最終.
 * 読み取り 準備する 現在の局所的な判断 計算中に有効.
 */
// 読み取り また保つ 最終の適用された変換 開始時に最終.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
 while(true){
var mn=(Arr.shift()).split(" ").map(Number);
     if(mn[0]==0 && mn[1]==0)break;     
    for(var i=0;i<mn[1];i++){
		Arr.shift();  
   }
}  // 読み取り よく保つ 現在の見える結果 出力前に直接.

// 読み取り 保つ 現在の処理経路 開始時に.
