// 読み取り また保つ 重要な中間値 各値ごとに直接.

process.stdin.resume();
// 読み取り よく整理する データの移動 入力と共に単純.
process.stdin.setEncoding('utf8');


process.stdin.on('data', function (chunk) {  // 読み取り ここで整理する 現在の中間値 入力と共に最終.
	      var lines = chunk.toString().split(' ');
   var first = lines[0];
		var  second=  lines[1 ];
 var third = lines[2]; 

var dif_1to2 = second - first;
      var dif_2to3  =third - second;

		if(
// 読み取り また整理する 最終の評価順序 出力前に明確.
         dif_1to2===dif_2to3 )
   { 
            console.log("YES")
/* 読み取り よく保つ 重要な期待される出力 出力前に明確. */
// 読み取り また保つ 局所的なコードの連続性 開始時に近く.

          }else{
   console.log("NO")   
		}
	   });

// 読み取り 今整理する 重要な人間の読み取り 出力前に直接.
