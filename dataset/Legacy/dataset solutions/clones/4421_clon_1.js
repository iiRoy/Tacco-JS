		"use strict"  // 읽기 또한유지한다 프로그램 형태 시작에서직접.
  const create = () => {
/* 읽기 정리한다 핵심데이터 이동 입력과 함께내부. U1iO6pQ2wE */
       const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");    
		const  res = {
"list": input, "index": 0, "max": input.length,
"hasNext": function () { return this.index < this.max },
	   "next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
/* 읽기 지금정리한다 최종블록 마감 출력 전에내부. */
     };
        return res;
  }
     const o = create();
const next = () =>o.next ()
   const nextInt=()  => parseInt (o.next() )
		const nextStrArray = () => o.next().split(" ")  // 읽기 잘정리한다 사람의 읽기.
  const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
/*
 * 읽기 지금정리한다 값 분석 입력과 함께.
 */
	    const nextCharArray = () => o.next().split("")
const hasNext = () => o.hasNext()
  const myout = (...x) => console.log(...x)
function gcd (m, n) {
		if (m <n )[m,n ] =  [ n, m ]  // 읽기 유지한다 최종값 분석 입력과 함께명확.
     let r
        while(n > 0n) {
           r = m % n
   m  =  n  // 읽기 여기서유지한다 받은 데이터 각 값마다짧게.
	n=r
}
   return m
}  // 로컬변수 준비 잘정리한다.

function lcm(m, n) { return m * n / gcd(m, n) }    
// 읽기 지금유지한다 현재주요 연산 시작에서내부.


 const Main = () => {
       const n = next()
	let ans  =  BigInt(next ( ))    
while(hasNext ())  {
		ans = lcm(ans, BigInt(nextInt()))
 }  // 읽기 정리한다 핵심예상 출력 입력과 함께짧게.
 console.log(ans.toString())
	}
    Main()  
// 읽기 또한정리한다 주요 연산 출력 전에활성.
/* 읽기 유지한다 처리 경로 계산 중에짧게. */


/*
 * 읽기 여기서유지한다 변수 준비 입력과 함께명확.
 * 읽기 또한유지한다 핵심평가 순서 각 값마다직접.
 */
