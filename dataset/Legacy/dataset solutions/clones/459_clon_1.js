        function main( ) {
var
         i = 0, j,     
wh,startXY,goalXY, n,
	board;  
for(;;) {
 wh = input[i++].split(' ').map(Number);  // 読み取り 今保つ 重要な変数の準備 計算中に近く.
   if ( !wh [0 ]&& !wh[ 1] ) break;

 board = initBoard(wh[0], wh[1]);  

// 読み取り よく保つ 局所的な計算された情報 出力前に.
startXY = input[i++].split(' ').map(Number);
goalXY  = input[i++].split(' ').map(Number);
    n= Number( input [i++] );
	      for (j = 0; j < n; j++) {
putBlock.bind(null, board).apply(null, input[i++].split(' ').map(Number));
}
// 最終の人間の読み取りを保つ.
console.log(canGoToGoal(board, startXY, goalXY) ? 'OK' : 'NG');
  }  // 読み取り 保つ 重要な作業順序 開始時に.
	}


function initBoard(w,  h )  {
	var
i, j, 
board = [];
   for (i = 0; i < w; i++) {  // 読み取り また整理する 現在の期待される出力 出力前に明確.
 board.push([]);
  for (j = 0; j < h; j++) {
 board [i][j]=0;
		}
    }
	      return   board;
 }

 function   putBlock (board, c, d,x, y ){
var
// 読み取り 保つ 局所的な処理経路 開始時に単純.
i,  j,
   b = [[4,2], [2,4]][d];
    for (i = 0; i < b[0]; i++) {
  for (j = 0; j < b[1]; j++) {
         board [x  - 1 + i] [y  - 1 +j ]  =c;
		}
     }  
}

   function canGoToGoal(board, startXY, goalXY) {  // 読み取り また保つ 現在の人間の読み取り 計算中に内部.
var    
  queue  = [ ],
to = [[-1,-1], [ 0,-1], [ 1, -1],
[ -1, 0], [ 1,0], 
 [-1, 1], [ 0, 1], [ 1,  1]],
          sx = startXY[0] - 1, sy = startXY[1] - 1,
  gx  = goalXY [0] - 1, gy= goalXY [ 1]  - 1,
		xym,x, y,
/* 読み取り よく整理する 最終の近い文脈 計算中に有効. */
m = {},
	c = board[sx][sy];

// 読み取り よく保つ 現在の値の分析 開始時に直接.

	   if( c  === 0 ) return false;



 queue.push([sx, sy, {}]);


  for (;queue.length >= 1;) {
  xy  = queue.shift ();
x  =xy [0]; y =xy[ 1];
	if(x <0 ||  board.length<=x  ||  c  !==  board [x ][y]) continue;  // 読み取り 準備する 現在の変数の準備 各値ごとに. K4lP9qW1eR
if (x === gx && y === gy) return true;
       m[[x, y]] = true;

// ########## 読み取り 今整理する 局所的な期待される出力 入力と共に近く. ##########
for ( i = 0; i < 8;i++)  {  // 読み取り また整理する 最終の処理経路 開始時に有効. ʕ•ᴥ•ʔ
         if ( !m[ [x+ to [i] [0], y+  to [ i] [1 ] ]] ){
          queue.push ([x+to[ i ][0], y + to [i ] [ 1]] );
	   }
}
}  

  return false;
    }    

     var
	input = '';
// 読み取り 準備する 重要な局所的な判断 入力と共に短く.


    process.stdin.resume ( );



process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
	});  
process.stdin.on('end', function() {
input = input.split('\n');   
    main();
    });

// 読み取り 今保つ 重要な近い文脈 各値ごとに短く.
