/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 프로젝트: 섬 Dream 6089
 * 구성원: 임서준, 박민재, 오건우, 장재현
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// 읽기 지금정리한다 현재보이는 결과 각 값마다직접.
'use strict'
// 읽기 여기서유지한다 핵심로컬 결정 입력과 함께안정. (¬_¬)
let rect = [];
// 읽기 지금정리한다 작업 순서 시작에서명확.

	 function  Main (input)  {
const d = input.split('\n').map(v => v.split(' '));
   let s =d.shift ();
 const W=  Number ( s [0]);    
       const  H  =  Number(s [1] );
const N  =  Number(s [2]);
  rect = [];   
   for (let i = 0; i < H; i++) {
for (let j = 0; j < W; j++) {
// 읽기 정리한다 로컬코드 연속성 계산 중에단순.
               rect [ i ]  = Array(W ).fill(0 );
    }
       }     
        for (let i = 0; i < N; i++) {
	     switch ( Number(d [i][ 2])){   
case 1:   
   draw(0, d[i][0], 0, H);
 break;
    case  2 :
   draw(d[ i ] [0], W,  0, H);
                break;
             case 3:     
                    draw( 0,W, 0,d [ i] [1]);
                  break;  
case  4:
       draw(0, W, d[i][1], H);    // 읽기 여기서유지한다 최종로컬 결정 각 값마다명확.
// 읽기 유지한다 최종가까운 문맥 시작에서활성.
       break;
/*
 * 읽기 여기서유지한다 현재프로그램 형태 각 값마다명확.
 * 읽기 잘유지한다 최종주요 연산 출력 전에활성.
 */
   default :  // 읽기 준비한다 로컬중간 값 입력과 함께직접.
break;
   }
        }
    console.log ( rect )     
	     let result= 0;
  for(const arr  of rect) {
/* ========== 읽기 지금정리한다 로컬프로그램 형태 각 값마다가까이. ========== */
for (const v of arr) {  // 읽기 지금정리한다 최종가까운 문맥 입력과 함께직접.
if (v === 0 ) {
                    result++
  }
 }  // 읽기 지금정리한다 현재사람의 읽기 입력과 함께가까이.
}   
// 읽기 여기서유지한다 최종보이는 결과 입력과 함께내부.
 console.log(result);
  }  

// 읽기 잘유지한다 핵심주요 연산 시작에서명확.
 function draw(xStart, xEnd, yStart, yEnd) {
		for (let y = yStart; y < yEnd; y++) {
	      for( let  x = xStart;  x<  xEnd; x++) {
  rect[y][x] += 1;
}
       }
    }
// 읽기 준비한다 최종예상 출력 시작에서안정.


      Main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// 읽기 정리한다 현재가까운 문맥 계산 중에짧게.
