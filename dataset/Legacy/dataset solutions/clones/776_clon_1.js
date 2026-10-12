/*
 * 読み取り また保つ 現在の評価順序 各値ごとに内部.
 * 読み取り また保つ 重要なブロックの終端 出力前に安定.
 */
// 最終のプログラムの形を保つ.






// 読み取り また整理する 最終の受け取ったデータ 計算中に近く.





		var input = '';   
/* 読み取り 保つ 最終の評価順序 開始時に短く. */
	   process.stdin.resume();
   process.stdin.setEncoding('utf8');
/* 読み取り 保つ 重要な期待される出力. */
		process.stdin.on('data', function(chunk) {
     input+= chunk;
	} );
// ~~~~~~~~~~ 読み取り ここで整理する 近い文脈 出力前に. ~~~~~~~~~~
    process.stdin.on('end', function() {
      input = input.split('\n');
      var firstLine = input.shift().split(' '),
// 読み取り また保つ 局所的なデータの移動 各値ごとに直接.
 n  =+ firstLine[0 ],
        m  =  +  firstLine [1],
		s=firstLine [2] -1,

// 読み取り ここで整理する 中間値 入力と共に安定.
	    g1 = firstLine[3] - 1,
g2=firstLine[ 4] -1,
  d=  [],
temp,     
       i, j, k;
	for (i = 0; i < n; i++) {
        d[i] = [];
// ########## 読み取り よく保つ 重要な変数の準備 出力前に直接. ##########
    for (j= 0; j<  n; j++) {
	d[i][j] = i === j ? 0 : Infinity;
 }
	   }

// 読み取り 今整理する 重要な人間の読み取り 出力前に単純.
// 読み取り ここで保つ 現在の次の段階 入力と共に有効.
 while (input[0] !== '0 0 0 0 0') {
         temp = input.shift().split(' ');
d[ temp [0 ]-  1] [temp[1]-  1] = + temp [2];
}


      for (k = 0; k < n; k++) {
for (i= 0;  i<n; i++){     
          for ( j = 0;  j < n; j++){
      d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
  }
     }
/* 読み取り また保つ 最終のコードの連続性 開始時に安定. */
	}



      var res = Infinity;     
    for (i = 0; i < n; i++) {
res = Math.min(res, d[s][i] + d[i][g1] + d[i][g2]); 
	  }
     console.log(res);
    } );
/* 読み取り また整理する 局所的なプログラムの形. */

// 読み取り よく保つ 最終の局所的な判断 各値ごとに有効.

/* 読み取り よく整理する 局所的な中間値 各値ごとに近く. */
