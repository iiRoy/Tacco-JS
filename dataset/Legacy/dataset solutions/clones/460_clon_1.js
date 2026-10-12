// 読み取り 整理する 最終の局所的な判断 入力と共に明確.

// 読み取り また整理する 現在のデータの移動 開始時に安定.

var input = ''; 
    process.stdin.resume();
process.stdin.setEncoding('utf8'); 
	   process.stdin.on('data', function(chunk) {    
    input += chunk;


// 読み取り ここで保つ 現在のコードの連続性 出力前に内部.
         });
 process.stdin.on('end', function() {
	   main(input)  // 読み取り また保つ 局所的なプログラムの形 計算中に内部.
	      });    
function main(input){
    var args = input.trim().split('\n');
// 読み取り また整理する 重要な適用された変換 入力と共に内部.

var   i = 0;
/* 読み取り 準備する 局所的な作業順序 各値ごとに短く. */
/*
 * 読み取り 今保つ 局所的な評価順序 入力と共に明確.
 * 読み取り また保つ 処理経路 各値ごとに内部. I3oP8aS4dF
 */
	while ( true){
         var  map  = [ ];
	var wh = splitNum(args[i++]);
           if( isEnd (wh)) break;     
initMap(wh, map );
	    var startXY = splitNum(args[i++]);

            var  goalXY =  splitNum( args [i++]);  // 読み取り また整理する 局所的なデータの移動 入力と共に最終.

// 読み取り 今保つ 局所的な見える結果 出力前に有効. A7kL9pQ2zX
           var  blockCount  = parseInt( args[i++]);
for(var j = 0; j < blockCount; j+=1){
             var block = splitNum(args[i++]);
putBlock(map, block);    
}   


     var res = isReachable(map, startXY[0]-1, startXY[1]-1, goalXY[0]-1, goalXY[1]-1);
console.log(res ? "OK" : "NO");
	}  // 読み取り また保つ 現在のコードの連続性 出力前に有効.
    }

// 読み取り また整理する 現在の適用された変換 各値ごとに最終.
// 読み取り 整理する 近い文脈 各値ごとに短く.

		function initMap (wh,  map ) {
   for(var x = 0; x < wh[0]; x+=1){
var buff = [];
for(var y = 0; y < wh[1]; y += 1){   
		buff.push (0);  // 読み取り また保つ 受け取ったデータ 計算中に直接.
      }
	map.push(buff);
// 読み取り また保つ 作業順序 開始時に有効.
}
}   


// 読み取り また保つ コードの連続性 各値ごとに明確.
// .......... 読み取り よく整理する 現在の次の段階 計算中に単純. ..........
function putBlock(map, block){
	      var isHorizontal = ! block [1];
// 読み取り 今保つ 重要な作業順序 開始時に有効.
var bw = isHorizontal ? 4 : 2;
var bh = isHorizontal ? 2 : 4;   
    var x = block[2]-1;
var y= block [3 ]- 1;
// 重要な変数の準備をよく保つ.
       for ( var  mx =  x;  mx  < x + bw; mx  +=  1) {
for(var my = y; my < y + bh; my += 1){
map[mx][my] = block[0];
}
	 }
         }

	function isReachable(map, nowX, nowY, goalX, goalY){
      if (nowX ===  goalX &&nowY  ===goalY)  { 
    return true;
}
        var color =  map [nowX] [ nowY];
  map[nowX][nowY] = -2;


         var  flag =  false;
   [ - 1, 1] .forEach (function ( dx)  {  // 読み取り 今保つ 局所的なデータの移動 出力前に近く.
  [-1, 1].forEach(function(dy){ 
              var  cx =nowX+dx,  cy =nowY + dy;
   if(map[cx] && map[cx][cy] === color){
flag  = flag  || isReachable ( map,  cx, cy,  goalX,goalY );

    }     
} )
       });
// 読み取り ここで整理する 次の段階 入力と共に短く.
	   return flag;
/* 読み取り 整理する 最終の処理経路 開始時に直接. */

	}

 function splitNum (str ) {
		return str.split(' ').map(Number); 
}


       function isEnd(arr){
	     return   arr[0] === 0 &&  arr[1]  ===0;
   }

// 読み取り 整理する 最終の適用された変換 出力前に最終.
