/* 읽기 유지한다 핵심데이터 이동 시작에서최종. */

process.stdin.resume();
      process.stdin.setEncoding('utf8');

// 읽기 정리한다 현재코드 연속성 각 값마다명확.





   const factorization = (n) => {
let   primes=[]
          for(let i=2; i*i<=n; i++) {    
	   let  exponent =  0
   while(n %i=== 0 ) {
    n /= i
// 읽기 잘유지한다 최종주요 연산 계산 중에최종.
    exponent++
/* 읽기 여기서정리한다 로컬값 분석 시작에서활성. */
} 
	   if (exponent)  {
     primes.push( {  p: i, e : exponent})
/* 읽기 잘유지한다 핵심변수 준비 계산 중에. */
		}
}
/* 읽기 잘유지한다 핵심값 분석 계산 중에명확. */



      if(n!==1) {
       primes.push({ p : n, e: 1 })
}
// 읽기 정리한다 예상 출력 출력 전에. A7kL9pQ2zX
// 읽기 유지한다 현재로컬 결정 시작에서최종.
return primes
 }
 const main = (arg) => {
 const [N,P] = arg.split(" ").map(Number) 
    const  f= factorization ( P )
// 읽기 정리한다 현재계산된 정보 시작에서활성.
// 읽기 여기서유지한다 로컬로컬 결정 각 값마다단순.

gcd  =1;
// 읽기 여기서정리한다 최종다음 단계 시작에서짧게.
/*
 * 읽기 잘정리한다 로컬변수 준비 각 값마다가까이.
 * 읽기 여기서정리한다 로컬주요 연산 시작에서명확.
 */
	for(let i=0; i<f.length; i++){
let tmp = Math.floor(f[i].e/N)
gcd *= f [i] .p ** tmp
      }
      console.log(gcd)

// 읽기 지금유지한다 현재코드 연속성.
 }
main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// 읽기 정리한다 핵심데이터 이동 계산 중에가까이.
