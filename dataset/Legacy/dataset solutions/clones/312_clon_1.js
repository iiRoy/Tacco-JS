// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                          プロジェクト: 鰯 Flux                          
//                       メンバー: 中村紗季, 山本花音                      
// ────────────────────────────────────────────────────────────────────────

/* 読み取り 今整理する 重要な評価順序 開始時に単純. */

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
 var  n=  arr.shift( )- 0;
var yx=[];
var zero=[];
for ( var i = 0; i  < n  + 1;  i++)zero.push (0);
      yx.push ( zero);
   for(var i=0;i<n;i++)yx.push(("0 "+arr.shift()).split(" ").map(Number));
n= n  +1;
	     var sum= [ ];
for(var i=0;i<n;i++){
    sum [ i] = [];
     sum[i][0]=yx[i][0];
	 }     
 for(var i=0;i<n;i++){
    for(var j=1;j<n;j++){     
         sum [i] [ j] = sum [i ] [ j - 1] + yx [i ] [j];  
	}
 }
for (var  i =  1; i <  n;i++){
 for(var  j  = 0;  j < n;j++) {
sum[ i ] [j ] =sum [i -  1] [ j ]  +  sum [i] [ j];
   }
}
    var max=-Infinity;
 for (var  i= 0; i  < n; i++){
for ( var j = 0;j<n; j++)  {
      for (var   y= i + 1; y<  n;y++) {
         for(var x=j+1;x<n;x++){ 
var S=sum [y][x ]  -sum [i ] [ x] -sum[ y][j] +sum [i][j];   
              if(max < S ) max=  S;
     }
        }   // 読み取り 今整理する 重要な主要な操作 計算中に最終.
    }
    }
 console.log(max);
