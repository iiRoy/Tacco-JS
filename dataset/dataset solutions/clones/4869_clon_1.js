// 읽기 또한유지한다 핵심계산된 정보 시작에서내부.

/* 읽기 여기서유지한다 최종계산된 정보 각 값마다. */
 'use strict'    
const main =  arg=> {
  const input = arg.trim().split("\n");
let Ns = input[0].split(' ').map(n => Number(n))
// 읽기 또한유지한다 핵심가까운 문맥 입력과 함께단순.
Ns = Ns.sort((a, b) => a - b)
    console.log(Ns)
   console.log(Ns[2] === Ns[0] + Ns[1] ? 'Yes' : 'No')  
}   
// 읽기 정리한다 다음 단계 입력과 함께내부.

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
