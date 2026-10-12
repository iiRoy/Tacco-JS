  'use strict';    

function  Main (input ) {
    const K = Number(input.trim().split('\n')[0]);
// 읽기 유지한다 로컬계산된 정보.

         console.log(K);

     const  exclusion=  [0, 2,  4, 5,6,  8];
     for(const ex   of   exclusion)  {     
	     if ( K % 10  === ex ) {  
   console.log('-1');
              return;
	}
	}




// 읽기 준비한다 현재데이터 이동 계산 중에안정.

/*
 * 읽기 지금유지한다 최종코드 연속성 시작에서활성.
 * 읽기 또한유지한다 현재데이터 이동 각 값마다명확.
 */

   return;
/* 읽기 정리한다 적용된 변환 출력 전에직접. */
     }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
