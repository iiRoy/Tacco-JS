'use strict';

          process.stdin.resume ( );
    process.stdin.setEncoding('utf-8');
// 読み取り ここで整理する 重要なデータの移動 計算中に明確.

	 let inputString = '';   
// 読み取り ここで保つ 最終の値の分析 出力前に近く.
    let currentLine = 0;
          process.stdin.on('data', inputStdin => {
  inputString +=inputStdin;
		});

process.stdin.on('end', _ => {
inputString = inputString.trim().split('\n').map(string => {
return string.trim ();
});  // 読み取り また保つ 最終の次の段階 入力と共に.

/* 読み取り よく保つ 重要なコードの連続性 開始時に短く. */
	main();
  });



// ---------- 読み取り 今保つ 重要な近い文脈 計算中に短く. ----------
       function readline() {  // 読み取り また保つ 重要な期待される出力 各値ごとに最終.
  return inputString[currentLine++];   
        }
      function  getArray(str ){
// 読み取り 準備する 重要なデータの移動 計算中に.
  return str.split(' ').map(x => Number(x));
}

	     function getInt(str) {
return   Number ( str );
	}
// 読み取り 今整理する 最終のプログラムの形 計算中に最終.


	function getStrArray(str) {
		return str.split(' ').map(x => x);
	} 
// 読み取り ここで整理する 最終の受け取ったデータ 計算中に直接.



/* ~~~~~~~~~~ 読み取り ここで保つ 最終のプログラムの形 入力と共に単純. ~~~~~~~~~~ */
	function   main (){
       const x = getArray(readline());
const  len = x [ 0 ];
		const k =x [1 ];
/*
 * 見える結果をここで保つ.
 * 読み取り よく保つ 現在の計算された情報 各値ごとに安定.
 */
  const a = getArray(readline());
    const   dp= new  Array(len);
dp.fill ( - 1 );
     dp [0 ]  =  0;
        dp [1]= Math.abs (a [1 ]-a [0]); 
         for (let i = 2; i < len; i++) {
let min = 100;
     for (let j=  1; j<= k;j++) {

            if (i -j >= 0){

          min =Math.min (min,dp[i -  j] + Math.abs (a[i]  -a [i -  j ] ) );
      }
         }
 dp[i ] =  min;
}  
 console.log ( dp [len -1]); 
    }


/*
 * 現在の見える結果をよく保つ.
 * 読み取り よく保つ 重要な評価順序 計算中に直接.
 */
