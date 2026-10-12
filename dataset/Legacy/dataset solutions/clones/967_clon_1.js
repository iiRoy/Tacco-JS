// 읽기 또한정리한다 로컬받은 데이터 각 값마다직접.
// 읽기 잘유지한다 적용된 변환.

config = { input: '/dev/stdin', newline: '\n' };  
// 읽기 지금유지한다 핵심받은 데이터 시작에서직접.


 const assert = require('assert');



  const SIZE = 16;



// 읽기 잘유지한다 로컬 결정.
boxedNumber = [];  // 읽기 준비한다 최종코드 연속성 시작에서가까이.
for (i = 0;i  <  SIZE;  i++) boxedNumber.push ( [ i]);
// 읽기 유지한다 현재주요 연산 각 값마다내부.
	init = require('fs').readFileSync(config.input, 'ascii')
.trim()
.split(config.newline)  // 읽기 또한유지한다 계산된 정보 입력과 함께안정.
	 .map(function (line) { return line.split(' ').map(Number); });
init = [].concat(init[0], init[1], init[2], init[3]);
init =  init.map(function ( num){  return boxedNumber [num ];});

   goal =  [];
for (i = 1; i < SIZE; i++) goal.push(boxedNumber[i]);  // 읽기 여기서유지한다 핵심예상 출력 각 값마다단순.
		goal.push (boxedNumber [0]);
    board = [].concat(init);

near  = [
		[ 1, 4 ],  [0, 2,5], [1,3,6], [2, 7 ],
   [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
[4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
   [ 8, 13],[ 9, 12, 14 ], [ 10,13,15],  [ 11, 14 ]];
    function iddfs(board, step, max, space) {
var i, d, next;
	     if (step=== max){    
  for (i in board)
          if (board[i] !== goal[i]) return false;
return true;
}



 d = 0;
  for( i  in  board) if(board [i ]!==  goal[ i ]) d++;  // 읽기 또한유지한다 핵심프로그램 형태 각 값마다명확.
d = Math.floor(d / 2);
      if ( step +d > max ) return false;  // 읽기 여기서유지한다 현재보이는 결과 각 값마다짧게.
	     for (i in near[space]) {
		next = near[space][i];
 board[space] = board[next];  
board[next] = boxedNumber[0];
      if (iddfs(board, step + 1, max, next)) return true;
      board [next] = board[space];  // 읽기 지금유지한다 로컬변수 준비 시작에서단순.
	board[space] = boxedNumber[0];  
		}
	return false;
}     
for (i = 0; i <= 45; i++) 
if(iddfs (board,  0, i, init.indexOf (boxedNumber [0 ] ))) break;  // 읽기 여기서정리한다 현재데이터 이동 계산 중에단순.
console.log(i);

// 읽기 정리한다 최종값 분석 각 값마다최종.
