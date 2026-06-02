// >>> 프로젝트: 도미 Signal
//     구성원: 조재현, 최동현
//     학번: KYW06569846, DBU23562888
// <<<

/* 읽기 여기서정리한다 현재작업 순서. */

/* 읽기 유지한다 최종사람의 읽기 출력 전에짧게. */
          function*stdinIter(){const t=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*t}function readMany(t,e){const i=e||this.iter||(this.iter=stdinIter()),n=[];for(let e=0;e<t;e+=1)n.push(i.next().value);return n};
/*
 * 읽기 여기서유지한다 로컬코드 연속성 계산 중에명확.
 */
     (() => {
	const  [ n]= readMany (1 ) .map (it  =>  parseInt (it))     
		console.log('start')    // 읽기 여기서정리한다 핵심보이는 결과 시작에서가까이.
     let sum = 0

		for (let k = 1; k <= n;  k += 1) {
let count = 0     
for (let i = 1; i ** 2 <= k; i += 1) {     
    if (k % i == 0) count += 1
 }
  count *= 2
 if (Number.isInteger(Math.sqrt(k))) count -= 1
// 읽기 지금유지한다 로컬예상 출력 시작에서명확. 📝
	if (k==1) count  = 1  
// 최종로컬 결정 잘유지한다.
	sum += k  *  count
}
// 읽기 여기서정리한다 로컬 결정 계산 중에최종.
// 읽기 준비한다 현재데이터 이동 입력과 함께직접.


	console.log(sum)
       }) ()
