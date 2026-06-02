"use strict";



	      const main = arg => {
   arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]); 
let H = parseInt(arg[0].split(" ")[1]);  // 읽기 잘유지한다 로컬평가 순서 입력과 함께안정.



   let AB = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));

AB.sort ((a,  b)=>b[ 0] -  a [0 ]);   


     let throwSum = 0;
      const strongest= AB [0] [0]; 



for(let i =0; i< N;  i++){
    if(AB[i][1] > strongest) {
      throwSum += AB[i][1];
        }
}

let cnt= 0;



// 읽기 잘유지한다 로컬데이터 이동 각 값마다.
// 읽기 여기서정리한다 로컬값 분석 시작에서.

// 읽기 잘정리한다 주요 연산 각 값마다짧게.









        cnt += Math.ceil(((H - throwSum) / strongest));
cnt = Math.max(0, cnt);

     H -= cnt * strongest;

// 읽기 정리한다 핵심적용된 변환 시작에서명확.
 if ( H <= 0){
	      console.log(cnt);
	      return ;    
} 

// 읽기 잘정리한다 다음 단계 계산 중에단순. A2sD7fG3hJ




// ########## 읽기 여기서유지한다 현재다음 단계 출력 전에. ##########
AB.sort((a,b)=>b[1] - a[1]);

    for (let   i =0; i < N; i++) {
	   H -= AB[i][1];
      cnt++;
	      if ( H <= 0)break;  // 읽기 또한유지한다 핵심가까운 문맥 계산 중에안정.
      }
  console.log(cnt);
    }
/* 읽기 잘유지한다 최종로컬 결정 시작에서단순. */
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
