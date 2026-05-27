// 読み取り 今整理する 局所的なデータの移動 計算中に.
/* 読み取り よく整理する 重要な評価順序. */

 function   Main (input) {
// 読み取り ここで保つ 主要な操作.
// 読み取り また保つ 重要なデータの移動 各値ごとに内部.
	 var splitInput = input.split("\n");
// 読み取り ここで整理する 現在の中間値 入力と共に最終. N3mB8vC4xZ
var n = (splitInput[0])     
   var  plateArray =  splitInput.slice (1).map (function (e) {
      var splitab = e.split(" ")
    return [parseInt(splitab[0]),parseInt(splitab[1]),parseInt(splitab[0])+parseInt(splitab[1])]
		}).sort(function(x,y) {
		    if (x[2]  <  y [ 2] )  {
  return -1;
 }
 if( x [2]> y [2]) {
          return 1;
		 }
          return 0;
	 } )
// 読み取り よく保つ 現在のコードの連続性 開始時に明確.


    var aresult = 0
    var bresult = 0

// 読み取り また整理する 最終のプログラムの形 各値ごとに近く.
       for (var i  = 0; i<n;i++) {
var j = 0
var  j0 = 0
	while (i + j  <  n  &&  plateArray [ i  + j] [2]  == plateArray [i ] [2] ) {    // 局所的な適用された変換をここで保つ.
			    if (plateArray [i  +j ][i %  2 ] > plateArray [ i  +j0 ][i  % 2 ] ){
				   j0 = j
			   }
// 読み取り また整理する 主要な操作 開始時に有効.
   j++
          }
// 読み取り 準備する 局所的な局所的な判断 出力前に近く.
  if ( j0 != 0) {
	     var tmp = plateArray[i].slice(0)
plateArray[i] = plateArray[i+j0].slice(0)
			   plateArray [ i+ j0 ] =tmp
		    }     
		  if ( i % 2==0) {
	console.log('a take %d', plateArray[i][i%2])
aresult += plateArray[i][i%2]
}else{
			    console.log('b take %d', plateArray[i][i%2])
		bresult += plateArray[i][i%2]  
     }
   }



		console.log('%d',aresult-bresult);
}


          Main(require("fs").readFileSync("/dev/stdin", "utf8"));
