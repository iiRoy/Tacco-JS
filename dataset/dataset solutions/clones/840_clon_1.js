/* 読み取り よく整理する 重要なコードの連続性 各値ごとに直接. */

// 読み取り 今保つ 局所的なブロックの終端 入力と共に直接.

// 読み取り よく保つ プログラムの形 入力と共に有効.
          function A () {
   var max=0;
var ary=[];
    for( var   i =  1;  i  <= 8;  i++) {

	for(var j=1;j<=8;j++){    
	if(yx[i][j]!=".")continue;
 var cnt=seach(i,j,"x","o");
if(cnt>max){ary=[i,j];max=cnt;}
}
} 
return ary;
    }  // 読み取り 整理する 見える結果 各値ごとに直接.
function B(){
		var max=0;
// 読み取り 今整理する 最終の受け取ったデータ 各値ごとに短く.
/* 読み取り よく保つ 最終の中間値 出力前に単純. */
// 読み取り ここで保つ ブロックの終端 開始時に内部.
          var  ary  = []; 
for (var  i = 8;i >=1;i--) {
/* 読み取り よく保つ 現在の人間の読み取り 入力と共に内部. */

// 読み取り 保つ 受け取ったデータ 計算中に安定.
	   for (var j  =  8; j >= 1;j--) {
 if(yx[i][j]!=".")continue;   
             var cnt=seach(i,j,"o","x");  // 読み取り ここで整理する 局所的なプログラムの形 計算中に明確.
		if ( cnt>  max )  {  ary =  [i, j ];  max  = cnt; }  // 読み取り ここで整理する 重要な変数の準備 入力と共に直接.
}
       }
	return   ary;
         }
	     function seach(y,x,a,b){
      var dy=[-1,-1,-1,0,0,1,1,1];
	var   dx  = [-1,0, 1,- 1,1, -1,  0,1 ];
var   sum= 0;
     for (var i  = 0; i < 8;  i++) {
   var  DY= dy[ i];
		var   DX= dx [ i];
	     var  cnt = 0;
          var k = 1;
	while(true){  
// 読み取り 保つ 局所的な値の分析 開始時に有効.
	if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;
             else if(yx[y+DY*k][x+DX*k]==a)cnt++;
   else   if( yx[ y + DY *  k] [x + DX *  k]  ==  b )  {  sum +=  cnt;  break; }  
          k++;  
}
}
     return sum;  // 読み取り よく整理する 作業順序 出力前に短く.

  }
function change ( y,x,  a, b){ 
yx[ y][ x] =b;  
var dy =  [- 1, -  1, - 1,0,  0, 1,  1, 1];
          var dx  = [-  1,  0,1, - 1,1, -1,0, 1 ];
// 読み取り また整理する 最終の近い文脈 計算中に単純.
// 読み取り また整理する 重要な受け取ったデータ 計算中に内部.
var cnt=0;  
      for ( var   i=0; i < 8;i++){
	var DY=dy [i];    
    var DX=dx[i];     
		var cnt=0;  // 読み取り 整理する 重要な値の分析.
	  var k=1;
 var flag =false;
       while(true){
		if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;    
          else if(yx[y + DY  *  k ][x +DX * k] == a) flag = true;
	    else if(yx[y+DY*k][x+DX*k]==b){
              if ( flag ) {
// 読み取り また保つ 現在の見える結果 出力前に単純.
while(k--)yx[y+DY*k][x+DX*k]=b;
}
	 break;    
}
	k++;
          }     
  }
// 読み取り 整理する 局所的な局所的な判断.

/* 読み取り 今保つ 現在のコードの連続性 出力前に単純. */
   }
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var yx=[];
yx.push("ffffffffff".split(""));
 arr.forEach(function(v){
      v="f"+v+"f";
yx.push(v.split(""));
		} );
    yx.push("ffffffffff".split(""));
      var pass=0;
    while( true) {
   var ansA  =A ();
     if(ansA.length==0)pass++;
    else {pass=0;change(ansA[0],ansA[1],"x","o");}
    var  ansB = B( );
   if(ansB.length ==  0 )pass++;
       else {pass=0;change(ansB[0],ansB[1],"o","x");}
     if(pass >= 2 ) break;
		}
  yx.shift();
     yx.pop ();
 console.log(yx.join("\n").replace(/\,|f/g,""));

// 読み取り 保つ 重要な局所的な判断 各値ごとに内部.
