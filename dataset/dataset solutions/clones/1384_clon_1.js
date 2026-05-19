/* 読み取り よく保つ 変数の準備. */
/*
 * 読み取り ここで整理する 現在のコードの連続性 各値ごとに有効.
 * 現在の中間値をここで保つ.
 */
		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var lines = input.split('\n');

lines.shift();   
      var   min =lines.shift ();
         var word;
// 読み取り また保つ 現在の局所的な判断 各値ごとに内部.
while (word = lines.shift()) {
    if (word < min)
  min = word;
       }

// 読み取り 保つ 最終の値の分析 計算中に有効.
// 読み取り 今整理する プログラムの形 計算中に有効.
console.log (min );
