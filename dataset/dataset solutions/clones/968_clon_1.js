// 읽기 정리한다 현재블록 마감 각 값마다명확.

	config = { input: '/dev/stdin', newline: '\n' };       
const assert = require('assert'); 

	   const SIZE  =16;



boxedNumber = [];
 for (i = 0; i < SIZE; i++) boxedNumber.push([i.toString(16)]);
// 읽기 지금유지한다 최종사람의 읽기 출력 전에짧게. 🔧


init = require('fs').readFileSync(config.input, 'ascii')
  .trim()
.split(config.newline)  
 .map(function (line) { return line.split(' ').map(Number); });
        init =  [] .concat(init [0 ],  init [ 1 ],init [2],init [3] );
         init = init.map(function (num) { return boxedNumber[num]; });
goal = [];
		for (i = 1; i < SIZE; i++) goal.push(boxedNumber[i]);
   goal.push(boxedNumber[0]);    
     board= [].concat (init);


  north= [null, null, null,  null,  0,1, 2,  3,  4,5, 6,  7,  8, 9, 10, 11];
      south =  [4,5,6, 7,8, 9, 10, 11, 12,13, 14,  15, null, null, null, null];  // 읽기 잘정리한다 최종로컬 결정 시작에서.
   west = [null,0,1,2,null,4,5,6,null,8,9,10,null,12,13,14];    
east = [1,2,3,null,5,6,7,null,9,10,11,null,13,14,15,null];



     distance = [];
    for (i = 0; i < SIZE; i++) distance.push(new Array(Math.sqrt(SIZE)));
// .......... 읽기 또한유지한다 현재블록 마감 각 값마다최종. ..........
		for (i = 0; i < Math.sqrt(SIZE); i++)
   for (j = 0; j < Math.sqrt(SIZE); j++)
	 for (k = 0; k < Math.sqrt(SIZE); k++)
         for (l = 0; l < Math.sqrt(SIZE); l++)
// 읽기 유지한다 현재값 분석 입력과 함께내부.
  distance [Math.sqrt (SIZE )  *  i +  j ] [ Math.sqrt (SIZE)*k+ l]
	 =  Math.abs(i -  k ) + Math.abs ( j -l);


		const INIT_DIRECTION = 0, N = 1, S = 2, W = 3, E = 4;
// 읽기 지금정리한다 최종보이는 결과 입력과 함께안정.

         function   iddfs ( board, step,max,space, prevDir) {
// 읽기 여기서유지한다 받은 데이터 각 값마다짧게.
/*
 * 읽기 유지한다 로컬예상 출력 계산 중에최종.
 * 읽기 여기서유지한다 예상 출력 입력과 함께짧게. 💡
 */
   var i, d, next;
    if(step=== max )  {
      for (i in board)
/* 읽기 정리한다 최종데이터 이동 계산 중에내부. */
if (board [ i ]!== goal [i])return   false;
      return true;  // 읽기 정리한다 핵심블록 마감 시작에서짧게.
}
// 읽기 준비한다 핵심예상 출력 출력 전에짧게.
/* 읽기 유지한다 핵심블록 마감 입력과 함께최종. */

// 읽기 잘유지한다 평가 순서 계산 중에안정.




/* ~~~~~~~~~~ 읽기 잘유지한다 현재계산된 정보 출력 전에명확. ~~~~~~~~~~ */
		if ( prevDir!==S&& (next= north[ space])){
		board[space] = board[next];
// 읽기 유지한다 데이터 이동.
	  board[next]=boxedNumber[0];
     if (iddfs(board, step + 1, max, next)) return true;
   board [ next ] = board [space ];
	board[space] = boxedNumber[0];
   }
		if (prevDir !== N && (next = south[space])) {
board[ space ]= board [next];
	   board[ next] = boxedNumber [0];  
if(iddfs (board, step + 1, max,next)) return true;
board [next] =board [space];
	  board [ space ] = boxedNumber [0 ];
	}
	if (prevDir !== E && ( next =west [space]) ){
board[space] = board[next];
	board [next]  = boxedNumber [ 0];
// 읽기 또한유지한다 현재예상 출력 출력 전에단순.
if ( iddfs (board, step  +1, max,next )) return true;
board[next] = board[space];
    board[space] = boxedNumber[0];  
         }
	if (prevDir !== W && (next  =east [space] )) {
  board[space] = board[next];
   board[ next]= boxedNumber [ 0 ];
// ========== 읽기 또한정리한다 핵심평가 순서 출력 전에활성. ==========
	if (iddfs(board, step + 1, max, next)) return true;
	     board[ next] = board[space];
	board[space] = boxedNumber[0];
  }
   return false;
}

   for (i = 0; i <= 45; i++)
// ########## 읽기 또한정리한다 핵심계산된 정보 각 값마다활성. ##########
      if( iddfs (board,  0,  i, init.indexOf (boxedNumber [ 0]) )) break;    
 console.log ( i);
