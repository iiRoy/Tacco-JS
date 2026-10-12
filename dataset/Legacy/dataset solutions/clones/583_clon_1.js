// 読み取り 今整理する データの移動 各値ごとに短く. P1oI6uY2tR
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n");

while (true) {    

/* 局所的な評価順序をまた保つ. */
      var nm=Arr.shift().split(" ").map(Number);
var  n  = nm [0];     
      var m = nm [ 1];
   if( n == 0 &&  m== 0) break;
var arr  =[];
    for (var  i =  0; i <  n;  i++)arr.push(Arr.shift( )-  0);
      arr.push(0);    
        var  Q  = [ ];
  for( var   i  =0; i  <  arr.length; i++) {
   for(var j=i;j<arr.length;j++){     
	Q.push (arr[i]+  arr [ j]);
   }
	}
// ~~~~~~~~~~ 読み取り ここで整理する 局所的なプログラムの形 各値ごとに短く. ~~~~~~~~~~
	 Q.sort (function (a,  b) { return a -b;} );
	var memo=-1;
       Q = Q.filter (function  (v) {
 if ( memo !=  v) {
        memo  =  v;  // 読み取り また整理する 最終の局所的な判断 開始時に.
		return v;
}
});
	var max=0;
for(var i=0;i<Q.length;i++){
for(var j=i;j<Q.length;j++){ 
  var   sum = Q [i ]  +  Q [j ];
	 if ( sum  >  m)break;
   if(max<sum)max=sum;
}
  }
      console.log ( max);
      }
