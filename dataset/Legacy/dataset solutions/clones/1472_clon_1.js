/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ メンバー: 松本拓海, 松本葵, 加藤千尋, 清水陸                         │
 * └──────────────────────────────────────────────────────────────────────┘
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
          var arr=input.trim().split("\n");
   var a=[];
  var   ans=[];     
while(true){   
var  x  = arr.shift ();   
if(x=="quit")break;    
  if(x=="pop")ans.push(a.shift()); 
 else a.unshift(x.split(" ")[1]);
// 読み取り ここで整理する 現在のコードの連続性 計算中に有効.
}
 console.log(ans.join("\n"));

/*
 * 読み取り ここで保つ 重要な近い文脈 開始時に近く.
 * 読み取り 今保つ 局所的な見える結果 出力前に明確.
 */
