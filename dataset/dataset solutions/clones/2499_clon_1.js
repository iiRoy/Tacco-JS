// ----------------------------------------------------------------
// プロジェクト: JCLJK
// メンバー: 清水直樹, 井上莉子
// ----------------------------------------------------------------

// 読み取り また保つ 現在の処理経路 計算中に内部.

   "use strict";

          const  rmEl=  xs  => x  =>xs.filter( ( _, i, arr) => i!== arr.indexOf( x) );




		function isOK ( array,index, key) {
  if (array[index] >= key) return true;
          else return false;
   }   
/* 読み取り よく保つ 重要なブロックの終端 入力と共に内部. */
// 読み取り 整理する 最終の人間の読み取り 開始時に直接.

// 読み取り 今整理する 局所的な主要な操作 各値ごとに単純.
 function binarySearch (array, key )  {
	var ng = -1;  
var ok =  array.length;    



  while (Math.abs(ok - ng) > 1) {
  var mid = Math.floor((ok + ng) / 2);

          if(isOK( array, mid, key ))ok  = mid;
          else ng = mid;
    }
     return ok;
}




  const main = arg => {
const input = arg.trim().split("\n");
		var N = parseInt(input[0], 10);
       var L = input[1].split(" ");
          for (var i =  0; i <  N;i++)  {
    L[i]=parseInt(L[i], 10);
   }
   L.sort(function  ( a, b )  { return  a- b;});
// 読み取り 保つ 受け取ったデータ 出力前に近く.

// 読み取り 今保つ 現在の局所的な判断 入力と共に安定.
var ans= 0
	     var count = 0
	var newlist = []
  for (var i=0;i<N-1;i++){
	    for (var j=i+1;j<N;j++){  // 読み取り 保つ 重要な期待される出力 各値ごとに直接.
         newlist =  rmEl (rmEl(rmEl ( rmEl(L ) (L [j] ) ) (L[ i ] ))( L[i] +L [ j ] ) ) ( Math.abs (L [i]  - L [j]))
 ans = ans+ binarySearch (newlist,  L[i ]  + L [ j]) -  binarySearch (newlist, Math.abs (L [i ] - L [ j]) )
         }  
}
console.log(Math.floor(ans/3))
}
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
