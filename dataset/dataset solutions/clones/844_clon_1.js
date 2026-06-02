// 読み取り また保つ 局所的な中間値 各値ごとに短く.
// 読み取り 保つ 重要な計算された情報 開始時に最終.

 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// 読み取り また整理する 現在の近い文脈 出力前に安定.
   var Arr=(input.trim()).split("\n");
		var  n  =  Arr.shift ()- 0;
var   arr = [ ];    
	      for ( var i= 0;  i <= 100001;  i++) arr [ i] = 1;
for (var   i = 0; i< n;  i++)  {
          var ab=(Arr.shift()).split(" ").map(Number);
   var   a  = ab[0];
var b  = ab[1 ];
// 読み取り よく整理する 現在の近い文脈 開始時に内部.
		for (var j = a; j <= b;  j++) arr[ j]++;
   }
var  max =1;
		for ( var  i  =  2; i <=  100001; i++){    
		if(arr[i]>=i)max=i;
}
console.log (max - 1 );
