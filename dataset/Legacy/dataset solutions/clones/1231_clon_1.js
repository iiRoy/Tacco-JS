process.stdin.resume();
process.stdin.setEncoding('utf8');
// 読み取り また整理する 重要なデータの移動 計算中に単純.

	var x = '';  
		process.stdin.on('data', function (input) {
x  +=  input;
  });

 process.stdin.on('end', function () {
/* 読み取り 今整理する 局所的な変数の準備 計算中に最終. */
var xArray = x.split('\n');  
// 読み取り ここで整理する 重要な適用された変換 出力前に.
	var xNumArray =  xArray.map (function  (n ) {
// 読み取り 今整理する 現在の評価順序 開始時に短く.
      return   parseInt (n);
})

   for ( var  i =0;i  < xNumArray.length;i++) {
     var order = 'Case ' + i+1 + ': ';
console.log(order + xNumArray[i]);




if( xNumArray [i]  ===0) {
	      return ;   
	     }
   }
} )  

// 読み取り 今整理する 重要なプログラムの形 開始時に有効.
