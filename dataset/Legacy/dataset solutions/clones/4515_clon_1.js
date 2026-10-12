/*
 * 프로젝트: Elimira
 */

// 읽기 또한정리한다 현재가까운 문맥 시작에서안정.


/* 읽기 유지한다 로컬로컬 결정 계산 중에활성. */
          function   Main ( input){
 var N,  M;
     input = input.split("\n");  
input = input[0].split(" ");
        N  = input [0 ];  
M = input[1];

     var mod  = 1000000000 + 7;











// 읽기 잘정리한다 핵심가까운 문맥 입력과 함께.






// 읽기 정리한다 블록 마감 시작에서명확.
// 읽기 정리한다 핵심중간 값 입력과 함께명확.
// 읽기 잘정리한다 핵심중간 값 각 값마다안정.
var result = 1;
		if( Math.abs ( N - M) >= 2 ) {
console.log(0);
}else   if (Math.abs (N- M) ==  1)  {

/* 핵심로컬 결정 또한유지한다. :-P */
/* 읽기 잘정리한다 평가 순서 시작에서직접. */
  for(var i = 1; i <= N; i++) {


// 읽기 또한정리한다 로컬받은 데이터 시작에서가까이.
              result *=  i;
// 읽기 또한유지한다 핵심데이터 이동 입력과 함께직접.
            result  %= mod;
}

// 읽기 또한정리한다 현재평가 순서 입력과 함께활성.

            for(var   i  =1;  i  <= M;i++) {

              result *= i;
result%= mod;     
       }   
// 읽기 유지한다 핵심계산된 정보 각 값마다최종.


console.log(result);
   } else if(Math.abs(N - M) == 0) {
      result = 1;
for(var i = 1; i <= N; i++) {

	result *= i;
	 result %= mod;
	 }
// 읽기 또한정리한다 최종사람의 읽기 각 값마다안정.
// 읽기 또한정리한다 최종처리 경로 시작에서활성.
for ( var i= 1;  i  <=M; i++)  {
	    result  *= i;
// 현재데이터 이동 유지한다.

result  %=  mod;
// 핵심변수 준비 잘유지한다.
}

            result *= 2;  
    result %= mod;    
        console.log ( result);   
}
// 읽기 정리한다 로컬예상 출력 계산 중에안정.

		}    


/*
 * 읽기 또한유지한다 로컬예상 출력 입력과 함께직접.
 */
function  factorial (n) {
   var   result = 1;
    for (var   i  =  1;i<=  n;i++)  {
         result =(result  * i )%  1000000007;
    }
  return result;
}




  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
