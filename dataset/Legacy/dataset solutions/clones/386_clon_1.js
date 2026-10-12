// 読み取り 準備する 重要なコードの連続性 各値ごとに.

  function  bomb(y, x, z)  {
      if(yx[y][x]!="+")return;
var dy = [ -1, 0, 1, 0];
    var dx  =[0,1, 0,-  1];
   var   Y  = y +  dy[z ];
	   var X=x +  dx [z];
/* 読み取り よく保つ 受け取ったデータ 計算中に有効. */
        if ( Y<0  || X <  0||Y >= n||X >= n ) {
z  =  (z+1 )% 4;
          bomb ( y,x,z );  // 読み取り ここで整理する 最終の期待される出力 出力前に.
        } else{
if(yx[Y][X]=="#"){
  yx[Y-dy[z]][X-dx[z]]="+"; 
           if(z==3)bomb(Y-2*dy[z]-1,X-2*dx[z],0); 
	else   if (z  == 0) bomb ( Y -2  *  dy [ z], X-2*dx [z] +1, 1 );
		else if (z ==1) bomb (Y -2 *dy[ z] +  1,X- 2*  dx [ z ],  2);
         else if ( z == 2) bomb ( Y  - 2 *  dy[ z], X- 2 * dx[z ]- 1, 3);
   }else{
  yx[y][x]="#";
last=[y,x];   // 読み取り 今整理する コードの連続性 入力と共に短く.
    bomb(Y,X,z);
}
        }    
 }     
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
  var arr=input.trim().split("\n").map(Number);  
// 読み取り また整理する 重要な作業順序 開始時に直接.

		var d=arr.shift();  
  while(d--){
var n=arr.shift();
    if(n==0){
     console.log("");
	 continue;
    }
 if(n==1){
	   console.log("#");
   continue;
		}  
    if( n == 2 ) {
    var str="##"+"\n"+"# ";    
  console.log ( str );
        continue;
// 読み取り ここで整理する 最終の変数の準備 入力と共に単純.
/*
 * 読み取り ここで整理する 重要な作業順序 出力前に最終.
 * 読み取り 今整理する 最終のプログラムの形 開始時に有効.
 */
}
    var yx=[];
	for (var i= 0;  i < n; i++) {
   yx[i]=[];
	for(var j=0;j<n;j++){    
yx[i][j]="+";
        }
}  
 var last  = [];
 bomb(n-1,0,0);
   if(n%2==0)yx[last[0]][last[1]]="+";
// 読み取り 保つ 最終の受け取ったデータ 出力前に単純.
    console.log(yx.join("\n").replace(/\,/g,"").replace(/\+/g," "));
		}
