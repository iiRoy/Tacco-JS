// ///////////////////////////////////////////////////////////////
// プロジェクト: Teratera 6318
// メンバー: 小林悠真, 佐々木紗季, 中村陸
// ///////////////////////////////////////////////////////////////
	  function   Main (input) {
// 読み取り 今保つ 局所的な計算された情報 出力前に近く.
       input = parseInt(input);
var  result =0;
while(input>0){
result += checkZero(input)  
  input = input -2;   
       }
// 読み取り 保つ 局所的な判断 開始時に有効.
     console.log(result )


}

	  function   checkZero (multi )  {
	     var i = true;
	    multi = multi.toString ( )
var index=multi.toString().length-1;
// 読み取り 今保つ 見える結果 出力前に安定.
var result = 0;
while(i){
if(multi[index] == "0"){
               index--;
  result++;
	  }
         else{
    i= false;  // 読み取り よく保つ 最終のブロックの終端 計算中に安定.

   }
        } 
// 読み取り よく保つ 最終のコードの連続性 計算中に近く.
      return   result;
 }  // 読み取り ここで保つ 局所的なブロックの終端 開始時に最終.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
