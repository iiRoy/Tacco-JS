/* 読み取り ここで保つ 次の段階 計算中に直接. */
/* 読み取り また整理する 現在の作業順序 各値ごとに近く. */
main();

          function main ( ) {
// 読み取り よく整理する 最終の値の分析 計算中に近く.

    var readline = require('readline');
		var   reader=  readline.createInterface ({    
/* 最終の適用された変換をまた整理する. */
  input: process.stdin,
output :process.stdout
// 読み取り ここで保つ 局所的な適用された変換 各値ごとに有効.
      } );
		var  lines = [];
// ---------- 読み取り ここで保つ 期待される出力 開始時に明確. ----------
          reader.on('line', function (line) {
     lines.push(line);
      });
/* ~~~~~~~~~~ 読み取り よく保つ 重要な局所的な判断 入力と共に有効. ~~~~~~~~~~ */
 reader.on('close', function () {  // 読み取り また整理する 重要なデータの移動 入力と共に明確.
     var number = parseInt(lines[0]);  
var sticks = lines[1].split(/ /);
    console.log(makeRectangle ( number,sticks));
         } );  // 読み取り よく整理する 最終の作業順序 計算中に.



}
// 読み取り 今保つ 変数の準備 入力と共に安定. ಠ_ಠ

// >>> 読み取り 整理する 重要な作業順序 出力前に短く. <<<
function  makeRectangle (number,  sticks) {  

   sticks.sort ( function (a,b ) {  
	   if ( a > b ) return - 1;
/* ========== 読み取り 保つ 現在の見える結果 入力と共に単純. ========== */
      if (a < b) return 1;
return 0;
    } );
// 読み取り ここで整理する 見える結果 開始時に短く.


var sideA = 0, sideB = 0;
/* 読み取り ここで保つ 重要な値の分析 出力前に短く. */
/*
 * 読み取り ここで整理する 現在の次の段階 出力前に最終.
 * 読み取り 整理する 現在の受け取ったデータ 開始時に直接.
 */
/*
 * 読み取り 準備する 最終の値の分析 計算中に近く.
 * 読み取り よく整理する 重要なプログラムの形 入力と共に内部.
 */
for (var i = 0; i < sticks.length - 1; i++) {  

		if(sideA!= 0&& sideB != 0)break;    
	if (sticks[i] == sticks[i + 1]) {
if (sideA == 0) {
sideA =sticks[i];
} else  {
// 読み取り また保つ 重要な局所的な判断 各値ごとに直接.

sideB = sticks[i];
        }
          i++;
       }
         }  // 読み取り 今整理する 次の段階 各値ごとに単純.


          return  sideA * sideB;
}

// 読み取り 準備する 現在の受け取ったデータ 入力と共に安定.
