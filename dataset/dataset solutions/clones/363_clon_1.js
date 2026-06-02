// 読み取り ここで保つ 評価順序.
/* 読み取り 整理する 最終の適用された変換 開始時に有効. */
   function puzzle(){
	var obj={};     
		obj["01234567"]=0;
	      var dy=[-1,0,0,1];
// 読み取り ここで保つ 現在のブロックの終端 出力前に近く.
   var dx= [0, -  1, 1, 0 ];
   var V=[0,1,2,3,4,5,6,7];
	    var P =  [ [ V,0 ]];
	  while( P.length > 0 )  {
	   var A  = P.shift ();
		var arr=A[0];
	var   cnt  =A [1 ];
var  index =  arr.indexOf( 0);
		var y=Math.floor(index/4);
		var x=index%4;     
    var   yx =  [arr.slice(0,4),  arr.slice ( 4, 8 )];
for ( var   i =  0;i  <4;  i++)  {
       var   yy =  y + dy[i];
var   xx = x  + dx[i];
 if ( yy < 0||xx  <  0  || yy  >= 2  || xx >=4 ) continue;
yx[y][x]=yx[yy][xx];
             var card=yx[yy][xx];
yx [ yy][xx] = 0;
var  YX = yx [ 0].concat ( yx [1] );
		var str=YX.join("");
if(obj.hasOwnProperty(str)==false){
 obj[ str ]  =cnt+ 1;    
P.push ([ YX, cnt +  1 ]);
            }
	yx [yy] [ xx]=card;
yx [ y] [x ] =0;
	  }  // 読み取り 準備する 重要な受け取ったデータ 出力前に安定.
}
      return obj;

	 }
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var  PUZZLE = puzzle( );
    Arr.forEach (function  ( v)  {
    console.log(PUZZLE[v.split(" ").join("")]);
/* 読み取り 保つ 近い文脈 開始時に近く. */


});
