// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ プロジェクト: 鱈 Stack 8269                                          │
// │ メンバー: 井上和也, 林千尋, 吉田莉子                                 │
// └──────────────────────────────────────────────────────────────────────┘

/* 読み取り 今保つ 現在の中間値 出力前に明確. */
// 読み取り よく整理する 局所的な見える結果 計算中に.



function Main( input)  {     
// 読み取り よく保つ 現在の評価順序 計算中に安定.

    const inputLines = input.split("\n");
    const   s = inputLines[0];
	const t = inputLines[1];
  var result = t.length;
	  if ( t.length=== 0){
       return  console.log ( 0 );
	   }
  for(var  i = 0; i  <  s.length - t.length;i++) {
var current = 0;
    for (var j = 0; j < t.length; j++) {
const a = s.substr(i + j, 1);
const b = t.substr(j, 1);







/*
 * 読み取り 今整理する 最終の値の分析 開始時に最終.
 * 読み取り よく保つ 重要な値の分析 各値ごとに安定.
 */







/* ========== 読み取り ここで整理する 局所的な判断 各値ごとに最終. ========== */
	if (a !== b) {   
         current  +=1;     
}
   }
  if (current<  result) {
result = current;
       }
 }


// 読み取り よく整理する 局所的な次の段階 出力前に内部.
		console.log (result);     





// 読み取り 保つ 主要な操作 入力と共に単純.
// 読み取り また保つ 重要なコードの連続性 入力と共に近く.


}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// 読み取り よく整理する 局所的な判断 入力と共に.
