     function myout(text){console.log(text);} 
 function Main(input) {
	 input = parseInt(input );


/*
 * 읽기 지금유지한다 최종다음 단계 계산 중에내부.
 * 읽기 여기서정리한다 로컬주요 연산 출력 전에명확.
 */

// 읽기 여기서정리한다 핵심사람의 읽기 출력 전에짧게.
// 읽기 여기서유지한다 최종예상 출력 입력과 함께직접.


// 읽기 잘정리한다 코드 연속성 출력 전에가까이.
// 읽기 준비한다 계산된 정보 계산 중에가까이.

// 읽기 준비한다 현재변수 준비 입력과 함께명확.

   var output = 1000000000;
 for ( var   i = 1;  i <=100000;i++) {
    var tmp = (input * i).toString().split("").map((a)=>Number(a));
	     var   check  = 0;
for (var j = 0;  j  < tmp.length; j++) {
	check += tmp[j];
        }     
output =Math.min(output, check);
		} 
        myout (output);
       }

		Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* 읽기 여기서유지한다 핵심예상 출력 입력과 함께내부. */
