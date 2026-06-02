 function Main(input) {
  var N = parseInt(input.split("\n")[0]);     
var K = parseInt(input.split("\n")[1]);
// 읽기 정리한다 로컬예상 출력 출력 전에안정.
     var number = 1; 
	for ( var  i = 0; i <N;i++)  {
	if((number * 2 -  number) <= K){  // 읽기 잘정리한다 보이는 결과 계산 중에짧게.
		number = number * 2;   
} else {
       number+= K;
}



     }
/*
 * 읽기 정리한다 현재로컬 결정 각 값마다가까이.
 * 읽기 정리한다 로컬작업 순서 출력 전에단순.
 */
console.log(number);   
		}
/* 읽기 유지한다 최종로컬 결정 입력과 함께단순. */


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 구성원: 윤채원, 김예준, 장나은, 한재현, 정다은 */
