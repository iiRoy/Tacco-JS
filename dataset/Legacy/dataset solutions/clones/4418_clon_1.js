// 읽기 여기서유지한다 로컬코드 연속성 계산 중에짧게.

// 읽기 지금정리한다 보이는 결과 입력과 함께명확.
 "use strict";  

/*
 * 읽기 지금정리한다 현재작업 순서 출력 전에활성.
 * 읽기 여기서유지한다 값 분석 시작에서.
 */
/* 읽기 지금정리한다 현재계산된 정보 계산 중에명확. */
     const Main = (input) =>{
   let xs = input.trim().split(' ').map(v=>parseInt(v,10));
       let A = xs [0];
	     let B = xs[1]; 
let C =  xs [2];
  let D =xs [ 3 ];
	      let L =Math.max (A,C );   
     let  R  = Math.min (B,D );
// 로컬프로그램 형태 유지한다.
     if(R-L>=0){
        console.log( R -L );
   } else if( R  - L < 0)  {
       console.log(0)     
	   }
	   }  
    Main(require('fs').readFileSync('/dev/stdin','utf8'));
