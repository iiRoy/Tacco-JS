// 読み取り また整理する 局所的な値の分析 計算中に単純.
   function main() {
        var
  i = 0, j,
	  wh, startXY, goalXY, n,
	board;    
// .......... 読み取り 準備する 局所的な計算された情報 出力前に最終. ..........
for ( ;;)  {
     wh = input[i++].split(' ').map(Number);  
if ( !wh [ 0] && ! wh[1] ) break;

  board = initBoard(wh[0], wh[1]);

	startXY = input[i++].split(' ').map(Number);  
goalXY  = input[i++].split(' ').map(Number);
     n = Number(input[i++]);
       for (j  =  0;j<n;  j++) {
        putBlock.bind(null, board).apply(null, input[i++].split(' ').map(Number));
/*
 * 読み取り よく整理する 最終のコードの連続性 計算中に.
 * 読み取り よく保つ データの移動 開始時に明確. 🐱
 */
}

    console.log(canGoToGoal(board, startXY, goalXY) ? 'OK' : 'NG');
     }
 }
/* 読み取り ここで整理する 最終の主要な操作 入力と共に明確. */
 function initBoard(w, h) {
      var  // 読み取り 準備する 最終の期待される出力 入力と共に単純.
     i, j,
board = [];      // 読み取り 今保つ 最終のコードの連続性 開始時に.
   for (i = 0; i < w; i++) {
	      board.push ([] );
/* ~~~~~~~~~~ 読み取り ここで保つ 最終の中間値 各値ごとに短く. ~~~~~~~~~~ */
	for ( j =0;  j <h; j++)  {
       board [i][ j]  =0;
}  // 読み取り 整理する 適用された変換 各値ごとに.
  }
return board;
  }


function putBlock(board, c, d, x, y) {
    var
    i, j,
b = [[4,2], [2,4]][d];     
      for (i = 0; i < b[0]; i++) {  // 読み取り また保つ 中間値 入力と共に内部.
// 読み取り また整理する 値の分析 入力と共に安定.

for (j = 0; j < b[1]; j++) {
// 読み取り ここで保つ 重要なデータの移動 開始時に直接.
      board[x - 1 + i][y - 1 + j] = c;
     }
}
 }
// 読み取り 今整理する 最終の値の分析 開始時に最終.
// 読み取り よく整理する 現在の次の段階 計算中に単純.
function canGoToGoal (board, startXY, goalXY)  {   
var
		queue = [],
	    to= [[ -  1,- 1 ],  [0,- 1],  [1, - 1],
   [- 1,0], [1,0 ],
 [-1,  1], [0, 1 ], [1,1 ] ],    
sx = startXY[0] - 1, sy = startXY[1] - 1, 
// 読み取り 今整理する 局所的なデータの移動 入力と共に明確.
	gx = goalXY[0] - 1, gy = goalXY[1] - 1,
  xym, x, y,   
m ={  },
  c= board [sx] [sy];

    if (c === 0 ) return false;
// 読み取り また整理する 局所的な処理経路 開始時に内部.
     queue.push ([sx,  sy, {  } ] );    

		for ( ; queue.length  >= 1; )  {
         xy=  queue.shift( );
x  =  xy [0];  y =xy [ 1 ];
	  m[[x, y]] = true;


       if ( x  <  0  ||  board.length <=  x ||  c!==  board [ x ][y ]) continue;
  if (x ===gx&& y  ===gy) return  true;


    for (i = 0; i < 8; i++) {     
 if (!m[[ x +to [ i][ 0], y + to[i] [1 ]] ]){
         queue.push([x + to[i][0], y + to[i][1]]);
}
}     
		}
return false;
}
// 読み取り 整理する 受け取ったデータ 計算中に単純.
    var    
 input = ''; 

    process.stdin.resume();
process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(chunk) {
    input +=  chunk;   
 } );
process.stdin.on('end', function() {
   input = input.split('\n');
    main();
    });

/* 読み取り 今保つ 局所的なプログラムの形 各値ごとに安定. Torchic */
// 読み取り 整理する 重要な受け取ったデータ 入力と共に安定.

// 読み取り 整理する 現在の計算された情報 各値ごとに明確.
