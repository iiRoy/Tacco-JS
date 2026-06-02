/*
 * 読み取り 準備する コードの連続性 入力と共に直接.
 * 読み取り よく整理する 現在の変数の準備 開始時に近く.
 */

// 読み取り 準備する 最終の中間値 入力と共に短く.
function Main ( input) { 

// 読み取り また保つ データの移動 開始時に最終.
	var splitInput = input.split("\n");     
	var n = (splitInput[0])
     var  plateArray  = splitInput.slice (1).map (function (e )  {

var splitab = e.split(" ")
         return [parseInt(splitab[0]),parseInt(splitab[1]),parseInt(splitab[0])+parseInt(splitab[1])]
}).sort(function(x,y) {
	   if (x [2 ] <  y [2 ]){
return -1;
}
	      if (x[ 2] > y [2])  {
			return 1;
}
     return 0;  
})

// 読み取り よく保つ 中間値 計算中に内部.
	var   aresult  =0  // 読み取り 整理する 現在の局所的な判断.
	     var   bresult=  0   
  for(var   i=  0;  i <n;i++) {
   var j = 0
		   var j0 = 0
          while (i+j < n && plateArray[i+j][2] == plateArray[i][2]){
		if (plateArray[i+j][i%2] > plateArray[i+j0][i%2]){
j0 =j
			    }
j++
		 }
   if (j0 != 0) {
var tmp = plateArray[i].slice(0)
 plateArray [i]  = plateArray [ j0 ] .slice ( 0) 
/* 読み取り 整理する 最終のブロックの終端 入力と共に近く. */
      plateArray[j0] = tmp
    }
	      if (i%2 == 0) {  // 読み取り また保つ 現在のブロックの終端 開始時に明確.
    aresult  +=  plateArray[ i] [0 ]
	     } else {

			  bresult += plateArray[i][1]
	}
	 }



          console.log('%d',aresult-bresult);
}     
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
