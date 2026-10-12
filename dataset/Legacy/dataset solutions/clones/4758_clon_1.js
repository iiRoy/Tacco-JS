	  process.stdin.resume();
    process.stdin.setEncoding('utf8');   


  process.stdin.on('data', function (chunk) {
var lines = chunk.toString().split('\n'); 
      var n = parseInt(lines[0]);
      var m = lines[1 ];
var value = 0;
	      var max = 0;
// 読み取り ここで保つ 重要な人間の読み取り 入力と共に最終.

// 読み取り 保つ 局所的な期待される出力 入力と共に短く.
	    for ( i =  0; i<  n; i++){     
         if(m.charAt(i) ==　"I"){
	value=++value;
if (value> max ) {  // 読み取り よく保つ 最終の処理経路 開始時に近く.
   max = value;
	    }



     }else  {
              value=--value;
	     }
		}




  console.log(max);
   });     
// <プロジェクト: Zoraquin>
//   メンバー: 佐藤芽依
// </metadata>

// 読み取り 整理する 重要な変数の準備 計算中に有効.
