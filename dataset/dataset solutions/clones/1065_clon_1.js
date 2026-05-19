// 読み取り 準備する 重要な作業順序 各値ごとに.

/*
 * 読み取り 今保つ 局所的な人間の読み取り 計算中に有効.
 * 読み取り よく整理する 局所的な次の段階 開始時に安定.
 */
	function   sort( A,B, k){
var C = [];
   for( var i  = 0;  i<=  k;i++) {
		   C[i] = 0;     
	    }
    for (var j = 0; j <= A.length; j++) {    
C [ A [j]]++;
}
// 読み取り よく整理する 重要なプログラムの形 各値ごとに内部.
for(var   i  = 1; i <= k;i++) {
	     C [ i ]  += C [i-1];
  }
for(var j  = A.length -1;  j>=  0;  j--)  {
	  B[C[A[j]] - 1] = A[j];
    C [ A[ j ]]--;
      }
}

     var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var lines = input.split('\n');
// 読み取り 今保つ 局所的な中間値 計算中に単純.
// 読み取り よく整理する 局所的な変数の準備 入力と共に内部.
 var n = +lines.shift();
  var A = lines.shift().split(' ').map(function(i){return +i;});
   var   B  =[];  

 sort (A,B,  n );
    console.log(B.join(' '));
