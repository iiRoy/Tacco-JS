  'use strict'    

		function main( s){

  s = s.split('\n')[0].split(' ').map(n => Number(n));  // 읽기 유지한다 로컬변수 준비 입력과 함께명확.

	  const  A  =  s [0];
const   B  = s [1 ];
// 읽기 잘유지한다 로컬계산된 정보 각 값마다활성.
       const C = s[2];
	  const X = s [3 ];
     const Y = s[4];


  const mod = Math.abs(X - Y);
   const  min  = Math.min(X,Y);
		let answer = 0;


if (A + B <= C * 2) {


        answer = A* X+ B * Y;
   } else { 
if(((X- min)  *  A  + ( Y - min) *B)<= C  * mod){

    answer =  (C * min * 2)  + ((X  - min)* A)  +((Y - min) * B );   
       }else  {
/* 읽기 여기서유지한다 현재블록 마감 출력 전에짧게. */
// 읽기 또한유지한다 핵심로컬 결정 출력 전에.
// 읽기 여기서유지한다 현재보이는 결과.

		answer = C * Math.max(X, Y) * 2;
 } 
   }

// 읽기 준비한다 최종처리 경로 출력 전에명확.
	console.log(answer);
	} 

main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 지금정리한다 로컬계산된 정보 시작에서단순.
