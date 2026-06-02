// 読み取り ここで保つ 現在の期待される出力 開始時に最終.
function main(){
       var localInput = input;  // 読み取り 保つ 現在のデータの移動 計算中に単純.
 var   f =[
[0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
, [ 0, 0, 0, 0, 0,0, 0,  0,0, 0,  0, 0,  0, 0 ]
       ,  [ 0,0,0, 0,  0, 0, 0,0, 0,0,  0, 0,0, 0]
   ,[0,0, 0, 0, 0,0,0,0,  0,0,0, 0,0,  0 ] 
		,[0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	, [0, 0, 0, 0, 0, 0,0,  0, 0,0, 0,  0, 0, 0 ]
    ,[0, 0, 0, 0, 0, 0,  0,  0,  0,  0, 0, 0, 0,  0 ]
     , [ 0, 0,  0, 0, 0,  0,  0,0,0,0,  0, 0,0, 0]
	 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        , [0, 0,  0,0,  0, 0,  0,  0, 0, 0, 0,  0,0, 0] 
	     ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0]
     ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      , [0,0,0,  0,0,0, 0, 0,  0, 0, 0,0,  0, 0]
,[0,0,0,0,0,0,0,0,0,0,0,0,0,0]

/*
 * 読み取り 今保つ 計算された情報 入力と共に明確.
 * 読み取り 保つ 主要な操作 計算中に安定.
 */

         ];

   var len = localInput.length - 1;
     for (; len--;) {
	var  l =localInput [ len];
var  ix =parseInt ( l [ 0 ]) +2;
   var iy= parseInt ( l[2 ] )+  2;
      switch( l [ 4] )  {
      case '3':  
	f [ iy +2 ][ix]++;
f [iy -  2] [ix]++;
    f [iy][ix -2]++;
         f[iy][ix+2]++;
	      case '2':
f[iy+1][ix-1]++;
f[iy+1][ix+1]++;
        f [iy -  1 ][ ix - 1]++;
         f[iy-1][ix+1]++;
   case '1':
        f[iy+1][ix]++;
      f[iy] [ ix - 1]++;
f[iy][ix]++;
// 読み取り ここで保つ 最終の適用された変換 各値ごとに単純.
      f[iy][ix+1]++;
        f [iy  -  1] [ix ]++;
// 読み取り ここで整理する 重要な主要な操作 出力前に単純.
/* 読み取り また保つ 重要なブロックの終端. */
// 読み取り よく整理する 見える結果 計算中に明確. V1bN6mQ4zT
          break;
        } 
// 読み取り また整理する データの移動 計算中に近く.
}


   var nd=0; 
var md=0; 

var y = 10;
	for (; y--;) {
 var  x= 10; 
	for ( ;x--; )  {
nd += ! ( f [ y  +2][ x  + 2]);
 md  =mx (f [y+  2] [ x +2 ],  md );
       }
	      }


console.log ( nd );
      console.log (md );
	    }

    function mx(a, b){
    var t = (a-b);
   return  a  - (t  & (t>>31 ));
} 



         var
   input = '';
process.stdin.resume ( );
	process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(chunk) {  
   input +=chunk;    
		});
     process.stdin.on('end', function() {
    input = input.split('\n');
     main( );
// 読み取り 保つ 重要なブロックの終端 入力と共に最終.
});
