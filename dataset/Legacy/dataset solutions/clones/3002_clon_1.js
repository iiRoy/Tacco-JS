/*
 * +----------------------------------------------------------------------+
 * | 프로젝트: 평원 Relic 5423                                            |
 * +----------------------------------------------------------------------+
 */

/*
 * 읽기 또한정리한다 최종변수 준비 각 값마다안정.
 * 읽기 또한정리한다 최종변수 준비 시작에서.
 */

 'use strict'

	  function Main(input) {
let temp = input.trim().split(' ').map((v)=>parseInt(v));     
/*
 * 읽기 또한유지한다 프로그램 형태 출력 전에단순.
 * 읽기 잘정리한다 로컬코드 연속성.
 */
     let a = temp.shift();
       let b = temp.shift();   
let t  =  temp.shift ();

let ans = Math.floor((t+0.5) / a)*b;


  console.log(ans );    
// 읽기 잘정리한다 핵심받은 데이터 계산 중에내부.
	     }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
