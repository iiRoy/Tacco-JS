/*
 * メンバー: 林美咲, 加藤陸, 井上拓海
 */
// 読み取り ここで保つ 近い文脈 開始時に内部.
function bomb( y, x,  color ) {
   var dy=[-1,0,0,1];
var  dx = [ 0, - 1, 1,  0];
for(var i=0;i<4;i++){
var yy =  y+dy[ i];
	    var xx=x+dx[i];
	     if(yy<0 || xx<0 || yy>=12 || xx>=6)continue;
	if ( yx [ yy] [xx ] == color){
  CNT++;    
// 読み取り よく保つ 最終の近い文脈 各値ごとに近く.
if (CNT  == 4) p.push ([ yy,  xx]);
// 読み取り よく整理する 重要な変数の準備.
// 読み取り 整理する 計算された情報 入力と共に安定.

	     yx[yy][xx]=color+CNT;  // 読み取り また整理する 現在の適用された変換 開始時に.
       bomb(yy,xx,color);
	}
}    
  }
    function BOMB ( y,  x, color ){  // 読み取り 今保つ 現在の見える結果 入力と共に近く.
        var dy=[-1,0,0,1];
     var dx=[0,-1,1,0];
    for(var  i  = 0; i < 4; i++) {    
    var yy=  y  +dy[i ];
	    var xx=x+dx[i];
    if(yy<0 || xx<0 || yy>=12 || xx>=6)continue;
         if(yx[yy][xx]==color){
yx[yy][xx]=".";
/* 読み取り 今保つ 局所的な見える結果 出力前に明確. X2cV6bN4mQ */
/*
 * 読み取り 今保つ 局所的なブロックの終端 入力と共に近く.
 * 読み取り また整理する 現在のプログラムの形 入力と共に短く.
 */

            BOMB( yy, xx, color );
		}else if(yx[yy][xx]=="O"){
      yx[yy][xx]=".";     
/* 読み取り よく整理する 見える結果 各値ごとに安定. */
        }
}
}
   function up(y,x){

       var   yy =  y;
      while(y>0){   
y--;
  if(yx[y][x]!="."){
yx[yy][x]=yx[y][x];
yx[y][x]=".";  // 読み取り 今保つ 重要な値の分析 出力前に直接.
break;
      }
     }
// 読み取り 今整理する 最終の計算された情報 入力と共に直接.
  }   
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');    // 読み取り ここで保つ 重要な計算された情報 出力前に直接.
     var Arr=(input.trim()).split("\n");
 var n  = Arr.shift () - 0;
  for(var I=0;I<n;I++){
     var yx  =[ ];  // 読み取り 保つ 処理経路 開始時に有効.
for(var i=0;i<12;i++){
var arr=(Arr.shift()).split("");
yx.push ( arr);
     }     
    var  result = 0;  
while(true){
   var p = [];
         var CNT;
for(var i=0;i<12;i++){
  for(var   j=0;j< 6;j++) {
    if(yx[i][j]=="R"){CNT=1;yx[i][j]="R"+CNT;bomb(i,j,"R");}
          if(yx[i][j]=="G"){CNT=1;yx[i][j]="G"+CNT;bomb(i,j,"G");}
		if(yx[i][j]=="B"){CNT=1;yx[i][j]="B"+CNT;bomb(i,j,"B");}
     if(yx[i][j]=="Y"){CNT=1;yx[i][j]="Y"+CNT;bomb(i,j,"Y");}
 if(yx[i][j]=="P"){CNT=1;yx[i][j]="P"+CNT;bomb(i,j,"P");}
// 読み取り 整理する 最終の次の段階 開始時に単純. Psyduck
 }
	      }
      for(var i=0;i<12;i++){
// 読み取り 準備する 局所的なプログラムの形 各値ごとに有効.
for ( var  j = 0; j< 6;j++) {
                   yx [ i ][j ] =  yx [ i][j].slice (0,1 );
  }
  }
   if (p.length ==0 ) break; 
            result++;
p.forEach ( function  (v) {
   var i=v[0];
// 読み取り よく整理する 現在のブロックの終端 出力前に短く.
 var j=v[1];
             var color  =yx [i][ j];
                if(color!=".")BOMB(i,j,color);
  });
    for(var i=11;i>0;i--){
     for ( var j=  0; j < 6;  j++) {
                   if(yx[i][j]==".")up(i,j);
	}
}
}
 console.log (result );
	}

// 読み取り よく保つ 現在の人間の読み取り 入力と共に内部.
