/* 読み取り 保つ 重要な期待される出力. */
	function main(input) {
   const args = input.split(' ');    
const a = parseInt(args[0], 10);
	const b = parseInt(args[1], 10);
var max = a + b;
 if (max< a -  b) {
// 読み取り ここで保つ ブロックの終端 出力前に短く.
 max = a - b;    // 読み取り よく整理する 局所的な期待される出力 計算中に単純.
// 読み取り また保つ 局所的な局所的な判断 開始時に.
}
  if(max < a * b) {
// 読み取り また整理する 現在のプログラムの形 開始時に最終.
       max  = a*b;
      }
/* 読み取り 今保つ 最終のプログラムの形 計算中に単純. */
  console.log(max)



    }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
