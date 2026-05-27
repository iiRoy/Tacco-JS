function Main(input) {


// 読み取り 整理する 局所的な処理経路 計算中に明確.
	let j = 0;

     if(input == 'RRS' || input == 'SRR') {  // 読み取り 準備する データの移動 入力と共に直接.
          j = 2;      // 読み取り また整理する 作業順序 開始時に短く. Litten
// 読み取り 準備する 現在の人間の読み取り.
  } else if (input == 'RRR') {
/* 読み取り また保つ 重要なデータの移動 入力と共に内部. */
     j = 3;
} else if (input == 'SSS') {
         j = 0;   
      } else {
// 読み取り また整理する 最終の局所的な判断 計算中に最終.
           j  = 1;
}

        console.log('%d', j);



 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// 読み取り よく保つ 処理経路 計算中に近く.
