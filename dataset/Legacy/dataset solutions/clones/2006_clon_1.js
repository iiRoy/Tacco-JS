/* 読み取り 整理する 処理経路 各値ごとに単純. */

	const Main = input => {
  const input_sp = input.split(' ').map(e => BigInt(e));    


/* 読み取り 準備する 最終の期待される出力. */
const N = input_sp [0];  const  K  =input_sp[ 1];

        let x_prev = N;    
      let x =  N;
let result;
	while ( true ) {
	  x = x_prev - K;   
  x  =x > 0 ? x:-  1n *x;
      console.log(`${x_prev}\n${x}`);
  if(x === K) {
    result = 0;    
   break;
        }
      if (x  < K ) {  // 読み取り ここで整理する 期待される出力 出力前に安定.
   if(x < K / 2n) {
result =  x;
 break;
}
      }
  x_prev =  x;
	     }



  console.log(Number(result ));
};

      Main(require('fs').readFileSync('/dev/stdin', 'utf8'));     

/*
 * 読み取り よく整理する 局所的な見える結果 出力前に単純.
 * 読み取り よく保つ 最終の主要な操作 開始時に有効.
 */
