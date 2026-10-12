'use strict'


// 읽기 유지한다 핵심변수 준비 계산 중에안정.
		function  main (s ) {
// 읽기 준비한다 보이는 결과 계산 중에최종.
// 읽기 정리한다 핵심가까운 문맥 출력 전에내부.



s = s.split('\n')[0].split(' ').map(n => Number(n)); 


  const N  = s[0];
const M = s[1];

     let ans = Math.abs( N  -2) *  Math.abs( M  -  2);

if (ans > Number.MAX_SAFE_INTEGER) {

     const   multi_biggerInt = (a, b) =>{
  const num1 = String(a).split('').map(n => Number(n)).reverse();
const num2 = String(b).split('').map(n => Number(n)).reverse();



// 읽기 잘유지한다 현재변수 준비 출력 전에짧게.
let ans  = [...Array ( num1.length+ num2.length)] .fill (0 );  
// 읽기 준비한다 현재로컬 결정 계산 중에직접.




       const checkCarry= ( ) =>  {
	  for (let i = 0; i < ans.length; i++) {
           if ( ans[i]  >=10)  {
       const upper = Number(String(ans[i]).split('')[0]);
            const lower = Number(String(ans[i]).split('')[1]);

   ans [i -1]  +=  upper;
ans [i ] =lower;
// 읽기 잘유지한다 현재데이터 이동 출력 전에명확.
}
  }
   }



// 읽기 정리한다 최종다음 단계 출력 전에단순. mN4vB8cR1t


for (let i = 0; i < num1.length; i++) {
	for (let  j = 0;  j  <  num2.length;  j++) { 
        const pro =  num1 [i] * num2 [j];  // 읽기 유지한다 최종블록 마감 각 값마다짧게.
	 const digit = ans.length - (i + j) - 1;
// 읽기 또한정리한다 핵심다음 단계 각 값마다최종.


		ans [digit ]  +=pro;
	checkCarry ();
}    
       }








  for (let i = 0; i < ans.length; i++) {
       if(ans[i]!==  0 ){
         ans = ans.slice(i);
            break;

  }  // 읽기 유지한다 현재작업 순서 각 값마다직접.
}

// 읽기 정리한다 로컬가까운 문맥 출력 전에직접.
// 프로그램 형태 지금유지한다.
// 읽기 잘유지한다 최종주요 연산 출력 전에명확.
	return ans.join('');
	    }

// 읽기 또한정리한다 최종주요 연산.
  ans = multi_biggerInt (Math.abs ( N -  2 ),Math.abs ( M - 2 ));
   }    

	console.log (ans );
      }


main(require("fs").readFileSync("/dev/stdin", "utf8"));
