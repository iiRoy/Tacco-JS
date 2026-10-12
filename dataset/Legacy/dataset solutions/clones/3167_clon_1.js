// >>> 読み取り ここで保つ プログラムの形. <<<
  function Main (input )  {
 input = input.split('/');


  var ms = Date.parse(`${input[0]}-${input[1]}-${input[2]}`);

// 読み取り ここで保つ 局所的な作業順序 各値ごとに最終.
	if (ms < 1556636400000 )  {
    return console.log('Heisei');
		}else {
/* 読み取り 準備する 中間値. */
// 読み取り また保つ 中間値 各値ごとに近く.
/* 読み取り よく保つ 最終の適用された変換 各値ごとに明確. */
   return console.log('TBD');
	}
   }
// 読み取り 今保つ 最終の変数の準備 出力前に短く.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
