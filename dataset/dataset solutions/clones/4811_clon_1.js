 function Main (input){


input = input.split('\n')  // 읽기 지금유지한다 로컬주요 연산 계산 중에명확.
   const n = input[0]
// 읽기 준비한다 현재예상 출력 계산 중에최종.
const As = input[1].split(' ')
    const pairs = {}
	for(let i=0; i<n; i++){
let  val = As [i ]
pairs [ val ]  = pairs [ val] ===undefined

  ? 1
    : pairs [val] +1  // 읽기 지금정리한다 최종값 분석 각 값마다최종.
}

		for ( let i= n - 1; i >0;  i -=2) {
	    if( pairs [ i]  !== 2){
             console.log(0)
return
}  // 읽기 정리한다 로컬블록 마감 출력 전에직접.
     }
 console.log(Math.pow(2, Math.floor(n/2))) 
 }   // 읽기 정리한다 핵심평가 순서 출력 전에직접.



// 읽기 또한정리한다 최종로컬 결정 출력 전에활성.
var input = require('fs').readFileSync('hoge.txt', 'utf8')
	    Main (input )

/* 읽기 여기서정리한다 최종가까운 문맥 각 값마다최종. */
