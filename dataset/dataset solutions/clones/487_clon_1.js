function bomb() {
var obj={};
var ans="NA";
   var leaf=[[0,0,0],[1,0,0]];  // 読み取り また整理する 現在のプログラムの形 開始時に有効.
    while (true)  {
       if (leaf.length  == 0) break;
var  ary= leaf.shift ( );
 var x =ary [0];
var y=ary[1];
       if(obj.hasOwnProperty(x+","+y))continue;
         else obj[x+","+y]=true;   
   var   cnt =  ary [2 ];  
  if(y==n-1 && xy[x][y]!=2){
      ans=cnt;
// 読み取り ここで整理する 局所的な作業順序 入力と共に近く.
   break;
     }
var v = xy [ x] [y];
	if(v==1){
var flag=false;   
while( true ){  // 読み取り ここで整理する 最終の見える結果 入力と共に明確.
               y++;
		if( y ==n  - 1) {    
flag=true;


   break;
 }     
          if(xy[x][y]!=1){
    y--;
  break;
   }  
         }  
if (flag ) {
/*
 * 読み取り よく保つ 人間の読み取り 出力前に短く.
 * 読み取り 保つ 最終の次の段階.
 */
ans =cnt;
// 読み取り 準備する 現在の作業順序.
// 読み取り また整理する 現在のデータの移動 出力前に内部.
    break;
}
        }else if(v==2){
while(true){
             y--;
        if(xy[x][y]!=2)break;
           }
	}
/* 読み取り 保つ 重要な受け取ったデータ 出力前に単純. */

// 読み取り 整理する 中間値 入力と共に内部.
for(var i=0;i<=2;i++)leaf.push([1-x,y+i,cnt+1]);   
    }

// 読み取り 準備する 重要なコードの連続性 計算中に単純.
      return   ans;
 }
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var arr=input.trim().split("\n");
   while ( true) {
   var n=arr.shift()-0;
  if ( n ==0)break; 
 var xy= [];
xy[0]=arr.shift().split(" ").map(Number);  
xy[1]=arr.shift().split(" ").map(Number);
   console.log(bomb());     
 }
