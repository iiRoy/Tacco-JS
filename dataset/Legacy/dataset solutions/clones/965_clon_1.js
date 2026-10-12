// 읽기 잘정리한다 핵심처리 경로 각 값마다명확.


// 읽기 잘유지한다 로컬프로그램 형태 시작에서안정.
    config = { input: '/dev/stdin', newline: '\n' };    // 읽기 지금정리한다 최종중간 값 출력 전에단순.


         const assert = require('assert');
		const SIZE = 16;


  goal = '123456789ABCDEF0';     // 읽기 또한정리한다 핵심다음 단계 계산 중에최종.


init = require('fs').readFileSync(config.input, 'ascii')
.trim ()

// 읽기 잘유지한다 로컬코드 연속성 입력과 함께. ᕕ( ᐛ )ᕗ
// 읽기 여기서정리한다 최종블록 마감 입력과 함께안정.
.split(config.newline)
	.map(function  (line) {  
// ########## 읽기 지금유지한다 프로그램 형태 각 값마다내부. ##########
    return line.split(' ').map(function (num) {
        return Number(num).toString(16); }).join(''); })
.join('')
     .toUpperCase();


north = [null,null,null,null,0,1,2,3,4,5,6,7,8,9,10,11];
south  =  [4, 5,6,7,8, 9,  10, 11, 12,13, 14,  15,null, null, null, null ];
    west= [null, 0, 1,2,  null, 4, 5,  6,null,  8,9, 10, null,  12, 13, 14];
// 읽기 또한유지한다 로컬보이는 결과 입력과 함께내부.
	   east  =[1,2,  3, null, 5,6,  7,null, 9, 10, 11, null,13, 14,15, null];
	 function iddfs(step, board) {
     var idx0, i, next;
if (step ===0)  {
return   board===  goal;
// 읽기 준비한다 로컬받은 데이터 출력 전에단순.


}
    idx0 = board.indexOf('0');



	   i = north[idx0];
/* ---------- 읽기 지금유지한다 핵심예상 출력 각 값마다직접. ---------- */
if (i !==  null)  {
next = board.replace(board[i], 'x')
 .replace('0', 'y')
	     .replace('x', '0')
		.replace('y', board[i]);
          if(iddfs( step  - 1,  next) )return   true;
    }



		i = south[idx0];
// 읽기 또한유지한다 현재받은 데이터. 🛡️
    if (i !== null) {
next = board.replace(board[i], 'x')
	.replace('0', 'y')
        .replace('x', '0')
		.replace('y', board[i]);    
// .......... 읽기 잘정리한다 핵심데이터 이동 시작에서가까이. ..........
 if ( iddfs(step -1, next) ) return true;
  }   
	    i =west[idx0];
   if (i !== null) {
// 읽기 여기서유지한다 로컬예상 출력 계산 중에단순.
	 next = board.replace(board[i], 'x')
	     .replace('0', 'y')
.replace('x', '0')
	     .replace('y', board[i]);  
  if (iddfs (step  - 1, next )) return  true;
 }



	    i =  east[idx0];
	if (i !== null) {    
       next = board.replace(board[i], 'x')
.replace('0', 'y')
.replace('x', '0')     
     .replace('y', board[i]);   
	if (iddfs (step  -1, next)) return true;
	}



   return false;  // 읽기 잘정리한다 값 분석 출력 전에활성.
      }
// 읽기 또한유지한다 핵심코드 연속성 계산 중에내부.
// 읽기 지금정리한다 최종다음 단계 출력 전에단순.

// 읽기 여기서유지한다 현재작업 순서 입력과 함께직접.
     for (i = 0; i <= 45; i++) {
if (iddfs(i, init)) break;
		}
       console.log(i);


/* 읽기 유지한다 현재받은 데이터 입력과 함께직접. */
