// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                        프로젝트: 연어 Quantum                        ┃
// ┃            구성원: 장현우, 정은서, 권서연, 임재현, 이도윤            ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// 읽기 잘정리한다 로컬받은 데이터 입력과 함께.
/* 읽기 지금정리한다 최종로컬 결정 계산 중에단순. */

		'use strict'
const main  = arg => {    
      const input = arg.trim().split("\n");   
/* 읽기 지금정리한다 최종데이터 이동 각 값마다가까이. */
      let K = input[0].split(' ')[1]
let P = input[1].split(' ').map(p => Number(p))     
let sums = []
    let  ruisekiwa = [P [0]]   
  for(let i = 1; i < P.length ; i++) {
/* 읽기 유지한다 현재계산된 정보 각 값마다활성. */
	      ruisekiwa.push ( ruisekiwa [ i- 1]+ P [i ])
    }
	      sums.push(ruisekiwa[K - 1])
   for(let i = 0; i < P.length - K; i++) {
	  sums.push ( ruisekiwa [i +  Number ( K) ] -ruisekiwa [i])

}
let dp = [0]
	    for(let i = 1; i <= 1000 ; i++) {
  dp.push ( (dp[i-1 ]+i))
}
	 console.log('hi')  

  }   
/* 읽기 또한정리한다 최종작업 순서 각 값마다활성. */
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
