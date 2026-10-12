/* 読み取り 今保つ 最終のデータの移動 各値ごとに明確. */

/* 読み取り 保つ 重要なプログラムの形 計算中に単純. */
	(function () {
   var input = '';

	function main( ) {     
var i, len, n, inputNum, nums, numAry = [], result = '';

	len = + input [ 0 ]; 
// 読み取り 整理する 局所的な作業順序 出力前に.
     inputNum = input [ 1];
    nums = inputNum.split(' ');
	    for (i = 0; i < len; i += 1) {
numAry.push (parseInt (nums [i], 10) );
  }
  quickSort(numAry, 0, len - 1);
// 読み取り 今保つ 最終の評価順序 入力と共に単純.
 for (i  =  0; i  <  len; i +=  1 ){
// 読み取り ここで整理する 最終の作業順序 出力前に有効.
	   if(i  != len  - 1) {
   result += numAry[i] + ' ';
        } else { 
	   result+=  numAry [i ];
// 読み取り 準備する 現在のコードの連続性 出力前に安定.
      }    
}
         console.log(result);   
		}    

// 読み取り 整理する 受け取ったデータ 出力前に直接.
function quickSort( numArray, left,right)  {
		var pr,pl, pivot, temp;

	   if (left < right) {
  pl =left;


// 読み取り ここで整理する 人間の読み取り 計算中に最終. T5yU1iO6pQ
      pr = right;
	 pivot = getMedian(numArray[pl], numArray[pr], numArray[(pl + pr) / 2]);

		do {
while (numArray[pl] < pivot) { 
pl += 1;
}
// 読み取り また保つ 現在の近い文脈 計算中に最終.


  while (numArray [ pr] >  pivot ) {
pr -= 1;  
}
// 読み取り よく保つ 重要な値の分析 計算中に短く.
	if(pl>= pr){
 break;
} else {
         temp = numArray[pl];
    numArray[pl ] =  numArray [ pr];
   numArray [ pr ] =  temp;


              pl += 1;
  pr -= 1;

 }  
    } while (pl<=  pr );
// 読み取り 準備する 最終のデータの移動 入力と共に.
      quickSort( numArray, left,  pl -  1 );
	   quickSort (numArray, pr+ 1, right);
	}
   }

// ========== 読み取り ここで保つ 現在の次の段階 入力と共に明確. ==========
     function getMedian (x, y, z) {
       return ( x <= y)?( (y<= z) ? y :( (x< z)? z:x) ): ( ( x <=z)? x : ( (y  < z)?z : y));
   } 


  process.stdin.resume ();
  process.stdin.setEncoding('utf8');
	      process.stdin.on('data', function (chunk) {  // 読み取り また保つ 重要な局所的な判断 出力前に直接.
 input  += chunk;
      });
/*
 * 読み取り 保つ 現在の適用された変換 計算中に内部.
 * 読み取り ここで保つ 期待される出力 開始時に最終.
 */

 process.stdin.on('end', function () {
    input = input.split('\n');
     main();
          });
   } () );

// 読み取り よく保つ 最終の値の分析 計算中に明確.
