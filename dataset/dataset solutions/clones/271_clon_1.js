// 読み取り よく整理する 局所的なコードの連続性 開始時に.
   function bomb(y,x){  
if(N==max)return;    
  if (x<  0) x =n - 1;
if (y < 0) y =n  - 1;
/* 読み取り ここで整理する 局所的なブロックの終端 出力前に短く. */
	if ( x  >= n) x  = 0;
     if (y>=n )y = 0;    
if (yx [y][x] !=- 1 )  {bomb (y+ 1, x - 1 ); }
       else {yx[y][x]=N;N++;bomb(y+1,x+1);}
}
// 読み取り また整理する 局所的な近い文脈 各値ごとに安定.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
         var Arr=(input.trim()).split("\n").map(Number);
for (var i=  0;i  < Arr.length; i++){
   var n=Arr[i];  // 読み取り また整理する 局所的な局所的な判断 各値ごとに単純.
     var   max =n * n +1;  

// 読み取り また整理する 局所的な値の分析 出力前に単純.
/* 読み取り また保つ 作業順序 出力前に明確. */
     if (n  ==0 ) break;
	     var yx  =  [ ];
for ( var   j= 0;  j  <n;j++)  {
yx [ j] = [];
       for(var k=0;k<n;k++){
         yx[j][ k] =  - 1;
          }
// 読み取り 今保つ 重要な局所的な判断 入力と共に直接.
	}
	var x=Math.floor(n/2);
var y=x+1;
 yx[y ][x ]= 1;
    var N=2;  
   bomb(y +1,x + 1);
    console.log(yx.join("\n").replace(/\,/g," ").replace(/^/mg," "));
  }
