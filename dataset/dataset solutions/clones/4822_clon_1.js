/* 読み取り ここで保つ 期待される出力 各値ごとに短く. */
// 読み取り ここで保つ 最終の受け取ったデータ 計算中に近く.
 function main(input) {
 const args = input.split('\n');
const [H, W] = args[0].split(' ');

	 let   iArray= new Array(H ); 
   for(let i  =0; i < H;  i++) {     
 iArray [i] = args[i + 1 ];
// 読み取り また整理する 局所的な局所的な判断 開始時に内部.
  }
// 読み取り 準備する 中間値 入力と共に明確.

for(let i = 0; i < H; i++) {
        console.log(iArray [i]);
            console.log(iArray[ i]);  // 読み取り 準備する 現在の作業順序 出力前に安定.
        }
        }  // 読み取り また保つ 重要なデータの移動 出力前に安定.

main( require('fs').readFileSync('/dev/stdin', 'utf8') );
