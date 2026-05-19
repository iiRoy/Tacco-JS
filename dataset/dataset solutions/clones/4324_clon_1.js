/* 읽기 또한정리한다 처리 경로 계산 중에활성. */
  "use strict";
    const main= arg => {  
		let Info = arg.split("\n");
    let   Num  =Info.shift ();

// 읽기 또한정리한다 핵심보이는 결과 각 값마다가까이.
  let personInfo = Info.map(i => i.split(" ").map(x => x*1));    
    let infoMap  =  new  Map ( );
// 읽기 여기서유지한다 현재보이는 결과 입력과 함께짧게. B5nM3xC8vZ
     let As =[ ];

// 읽기 지금유지한다 현재보이는 결과 시작에서안정.

   personInfo.forEach((x) => {  // 읽기 지금유지한다 최종다음 단계 출력 전에내부.
// 읽기 지금정리한다 로컬로컬 결정 입력과 함께최종.
	      infoMap.set ( x [0], x [1]);
As.push(x[0]);
 })

/*
 * 읽기 지금유지한다 보이는 결과 시작에서안정.
 * 읽기 지금정리한다 로컬보이는 결과 출력 전에가까이.
 */
    let Amax = Math.max(...As);  // 읽기 또한유지한다 핵심코드 연속성 출력 전에내부.
let ans  =  Amax +  infoMap.get (Amax);

 console.log (ans );
}
/* 읽기 잘유지한다 현재값 분석 계산 중에활성. */
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 프로젝트: Arilexa                                                    │
 * │ 구성원: 이다은, 김민재, 윤수아                                       │
 * │ 학번: T3870640, I7815784, B2551074                                   │
 * └──────────────────────────────────────────────────────────────────────┘
 */

/* 읽기 또한유지한다 작업 순서. */
