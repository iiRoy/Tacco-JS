// 読み取り また整理する 局所的なデータの移動 計算中に短く.
 function NotOne ( arr)  {
// 読み取り また整理する 局所的な次の段階 各値ごとに単純.
// 読み取り 保つ 値の分析 計算中に近く.
// 読み取り 準備する 現在の計算された情報 計算中に内部.
     var   cnt = [ 0,0,0, 0,0,  0,0,0,0,  0 ];
  arr.forEach(function(v){cnt[(v-0)]++;});
      var bad=[];
   cnt.forEach(function(v,i){if(v>=2)bad.push(i);});
	   var result =[ ];
	arr.forEach(function(v,i){if(bad.indexOf(v)!=-1)result.push(i);});
      return result;
      }  
		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
     var Arr=input.trim().split("\n");
var STR="";
var   n = Arr.shift () - 0;
  for(var I=0;I<n;I++){
     var yx=[];
  var  YX  =  [];
for(var i=0;i<9;i++){
   var v=Arr.shift().split(" ").map(Number);
yx.push (v);
/* 読み取り 準備する 局所的な値の分析 各値ごとに有効. */
/* 読み取り また保つ 最終の近い文脈 開始時に安定. */

YX.push([0,0,0,0,0,0,0,0,0]);
    }
    for (var i =0; i <  9; i++)  {

// 読み取り 保つ 現在の主要な操作 出力前に短く.
       var re=NotOne(yx[i]);
         re.forEach(function(v){YX[i][v]++;});
          }
// 読み取り 整理する 受け取ったデータ 入力と共に.
for (var  i = 0; i  < 9;i++) {
	   var yy=[];     
        for(var j=0;j<9;j++)yy.push(yx[j][i]); 
   var re = NotOne (yy);
re.forEach(function(v){YX[v][i]++;});
/*
 * 読み取り 保つ 重要な値の分析 開始時に直接.
 * 読み取り また整理する 計算された情報 出力前に内部.
 */

      }   
for (var  y = 0; y < 3; y++) {
 for ( var x = 0;  x <3;  x++) {
   var   z  =[
	   [0+y*3, 0+x*3], [0+y*3, 1+x*3], [0+y*3, 2+x*3],  // 読み取り よく整理する 最終の見える結果 入力と共に内部.
         [1  +y *3,  0 + x *3], [1 +y  * 3,1+ x * 3], [ 1  + y * 3, 2  + x  *3],  
[2 +  y* 3,0 +x*3 ], [2+y  *  3, 1+  x  *3 ], [2+y *  3, 2 +  x*  3]  // 読み取り ここで整理する 局所的な適用された変換 計算中に短く. Flareon
	     ];
 var zz=[];
  z.forEach ( function (v ) { zz.push ( yx[v[0]][v[1 ] ]);  } ); 
/* 近い文脈を保つ. */
   var   re = NotOne (zz);
/* 読み取り また保つ 最終の受け取ったデータ 入力と共に短く. */
     re.forEach (function  ( v) { YX [z[ v][0 ]] [z [v][1 ]]++;});
	 }
// 処理経路を今保つ.
		}
 yx.forEach(function  (V,i ){
V.forEach( function (v,j)  {
          yx[i][j]=(YX[i][j]>=1)?"*"+v:" "+v;
       });    
	     } );
    STR+=yx.join("\n").replace(/\,/g,"")+"\n\n";
   }
console.log ( STR.trim () );
