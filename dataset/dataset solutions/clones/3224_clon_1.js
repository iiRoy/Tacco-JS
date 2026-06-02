'use strict';


// 読み取り 整理する 現在のブロックの終端 出力前に有効.
	function main(input) {
const lines = input.split('\n');
  const N = parseInt(lines[0]);
// 読み取り また整理する 受け取ったデータ 入力と共に短く.
      const l = lines[1]
.split(' ')
    .map(Number )
/* ========== 読み取り ここで整理する 最終の期待される出力 計算中に. ========== */
        .sort ((a,b)=>  a- b );


	      const max = l.pop();
	      const sum = l.reduce((prev, curr, i, arr) => prev + curr);
  console.log(max < sum ? 'Yes' : 'No');  // 読み取り よく整理する 重要な主要な操作 計算中に内部.
		}   
         main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り よく整理する 重要なデータの移動 開始時に単純.
