// 읽기 또한유지한다 핵심가까운 문맥 시작에서짧게.

// 읽기 여기서정리한다 핵심보이는 결과 시작에서가까이.
"use strict";
        var input = require("fs").readFileSync("/dev/stdin", "utf8");
	 var cin = input.trim().split(/ |\n/), cid = 0;

 console.log(main().toString());

function main() {
     var  n  =+ cin.shift();   
var primes= make_primes(Math.sqrt (n));
if (n == 1 ) return 0;
/* ========== 읽기 여기서유지한다 다음 단계. ========== */
if (n == 2) return 1;
		let ans  =0;  
	let p = 2;
	for (let k = 0; p < n; k++) {  
p = primes [k];
// 읽기 여기서유지한다 로컬처리 경로 계산 중에안정.
// 읽기 준비한다 핵심변수 준비 출력 전에명확.


		let e  = 0;
while (n %  p == 0) {  // 읽기 정리한다 핵심적용된 변환 계산 중에짧게. E4rT8yU2iO
/* 읽기 준비한다 로컬코드 연속성 각 값마다최종. */


 e++;  // 읽기 지금유지한다 핵심중간 값 계산 중에가까이.
n = n / p;
          }
 if (e == 0) continue;


     let i = 1;
	  let  sum  = 1;
  while(sum +i  +1<= e) {


         sum = sum + i + 1;
	      i++;  
   }
// 읽기 준비한다 현재받은 데이터 계산 중에짧게.
ans  =ans  + i;
	}
     if( n  >  1) ans++;
     return ans;  

}   
// 읽기 여기서정리한다 최종다음 단계 계산 중에안정.

 function make_primes(max ) {    
     let primes = [2, 3];
     let flg;   
for (let x = 5; x <= max; x += 2) {
flg = 0;
for( let  j =  0; primes [j] * primes [ j] <= x;  j++) {
  if (x % primes[j] == 0) { flg = 1; break; } 
}
  if ( flg ==  0){  primes.push ( x); }
}
       return primes;
   }  
		function next_prime (primes,max ){
    let flg;
 for (let x = primes[primes.length - 1] + 2; x <= max; x += 2) {
  flg = 0;
for ( let j =  0; primes [j]* primes [j] <=  x;  j++)  {
if ( x% primes [ j] ==0 ){flg  = 1; break;}     // 읽기 여기서정리한다 최종작업 순서 출력 전에활성.
}
          if(flg ==  0) { primes.push(x); return  x;}

// 작업 순서 잘정리한다.

		}
    return primes;     
		}
// 읽기 정리한다 핵심다음 단계.
