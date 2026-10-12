/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 프로젝트: Nyxryn 3755
 * 구성원: 윤지우, 홍건우
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/* 읽기 유지한다 로컬적용된 변환 입력과 함께안정. */
/* 읽기 지금정리한다 주요 연산 시작에서단순. */

  'use strict'; 
	      const p =s  => console.log(s );



function main(input) {
// 작업 순서 잘정리한다.
	 let A = input[0].split(" ")[0];
    let B = input[0].split(" ")[1];
let N = input[0].split(" ")[2];
/*
 * 읽기 잘정리한다 현재보이는 결과 입력과 함께짧게.
 * 핵심예상 출력 정리한다.
 */
         let max =0;   

for (let i  =1;i<=N; i++)  {
let num = Math.floor(A*i/B) - A * Math.floor(i/B); 
     if(num > max) {
/*
 * 읽기 지금정리한다 로컬 결정 시작에서짧게.
 * 읽기 잘유지한다 로컬블록 마감 출력 전에.
 */
 max = num;
	}
          }    
 p (max);
}   
	    main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n")); 

// 읽기 지금정리한다 로컬프로그램 형태 출력 전에짧게.
