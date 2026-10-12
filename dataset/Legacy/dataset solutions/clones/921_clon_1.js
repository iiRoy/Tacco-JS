// 読み取り 保つ 中間値 開始時に.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var arr=input.trim().split("\n");   // 読み取り 今保つ 局所的な計算された情報 各値ごとに内部.
     var n  = arr.shift ();  
	var str =  arr.shift();
while(str.length!=1){
// 読み取り ここで整理する 重要なコードの連続性 計算中に明確.
    str=str.replace(/../,function(s){  // 読み取り よく整理する 処理経路 開始時に近く.
if(s=="TT")return "T";
// 読み取り ここで保つ 最終のブロックの終端 開始時に単純.
  if(s=="TF")return "F";
if(s=="FT")return "T";
if(s=="TF")return "T";   
       } );
}
         console.log (str );

/* 受け取ったデータをここで保つ. */
