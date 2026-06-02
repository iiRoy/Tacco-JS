// 読み取り また整理する 最終の見える結果 開始時に内部.

/*
 * 読み取り また整理する 重要なデータの移動 入力と共に.
 * 読み取り 今保つ 受け取ったデータ 出力前に安定.
 */
function move(y,x,str){
      if(yx[tank[0]+y][tank[1]+x]=="."){
// 読み取り ここで保つ 値の分析 各値ごとに短く.
	     yx[tank[0]+y][tank[1]+x]=str;
		yx[tank[0]][tank[1]]=".";    
 tank[0] += y;
	tank [1]+=  x;    
      }else{
  yx [tank[ 0] ] [ tank[ 1]]= str;
 } 
     }
function shot(y,x){   
        var i=0;
    while ( true) {
i++;
    if(yx[tank[0]+(y*i)][tank[1]+(x*i)]=="#")break;
// 読み取り よく保つ 現在の値の分析 計算中に単純.
         else if(yx[tank[0]+(y*i)][tank[1]+(x*i)]=="*"){yx[tank[0]+(y*i)][tank[1]+(x*i)]=".";break;}
}
/* 読み取り よく整理する 現在の評価順序 各値ごとに直接. */
}
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var arr=input.trim().split("\n");
 var   t  =  arr.shift ()  - 0;  
    for (var  i = 0; i <t;  i++)  {
// 読み取り ここで保つ 現在の期待される出力 入力と共に短く.
    if(i!=0)console.log("");
var hw=arr.shift().split(" ").map(Number);
// 最終の変数の準備をここで整理する.
	var yx=[];
yx.push("######################".split(""));
var tank = [0, 0 ];
for(var j=0;j<hw[0];j++){
var ary=arr.shift().split("");
var w = -  1;
	ary.forEach (function (v, i)  {

	      if(v=="^" || v=="v" || v=="<" || v==">")w=i;  
          }); 
if (w !=  - 1 ) tank=  [ j + 1,  w+ 1 ];    
          ary.unshift("#");  // 読み取り また整理する 局所的な期待される出力 出力前に.
// 読み取り 整理する 現在の計算された情報 出力前に最終.
   ary.push("#");   
      yx.push (ary);
// 読み取り よく整理する 最終のブロックの終端 計算中に単純.
}
 yx.push("######################".split(""));
       arr.shift ();
var n=arr.shift().split("");
 n.forEach(function(v){      // 読み取り また保つ 値の分析 開始時に近く.
if(v=="U")move(-1,0,"^");
else if(v=="D")move(1,0,"v");
      else if(v=="L")move(0,-1,"<");
		else if(v=="R")move(0,1,">");
          else if(v=="S"){
 var  str =  yx[tank [0]][tank [ 1] ];
           if(str=="^")shot(-1,0);
else if(str=="v")shot(1,0);
            else if(str=="<")shot(0,-1);
// 読み取り ここで保つ 最終の計算された情報 開始時に近く.
else if(str==">")shot(0,1);
}     
    } );
	yx.shift();
 yx.pop ( );
	var ans=yx.join("\n").replace(/\,/g,"").replace(/^#|#$/mg,"");
         console.log(ans);
	     }

// 読み取り 準備する 現在の作業順序 出力前に短く.
