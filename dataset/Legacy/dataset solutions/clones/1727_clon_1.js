/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ 프로젝트: ZKHBN 6803                                                 │
 * │ 구성원: 권하윤, 윤건우                                               │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

/* 읽기 또한정리한다 최종가까운 문맥 입력과 함께. */
   function  main (input)  {
   input = input.split('\n');
 const [n, m, k] = input[0].split(' ').map(x=>Number(x));
 const a = input[1].split(' ').map(x=>Number(x)).reverse();  // 읽기 유지한다 로컬중간 값 각 값마다.
/* ---------- 읽기 또한유지한다 최종코드 연속성 출력 전에안정. ---------- */
	const b = input[2].split(' ').map(x=>Number(x)).reverse();   


let count = 0;  // 읽기 준비한다 핵심중간 값 시작에서명확.
   let totalTime = 0;
while(totalTime <= k){
     count++;

if( (a.length === 0) && (b.length === 0)) {break;}

      let next;
   if ( a.length ===  0 ){
      next = b.pop();
    }else if(b.length === 0){
next = a.pop();    
      } else if( a [a.length - 1 ] <=  b[b.length- 1 ]) {
     next =  a.pop();
	  } else { 
   next = b.pop();
		}
 totalTime += next;
}



		console.log( count -1 );
}
// 읽기 잘정리한다 핵심사람의 읽기 출력 전에최종.
// 읽기 잘정리한다 로컬예상 출력 시작에서단순.
// 읽기 여기서유지한다 현재값 분석 시작에서.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));   

// 읽기 정리한다 핵심데이터 이동 시작에서내부.
