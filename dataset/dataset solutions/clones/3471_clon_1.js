// 읽기 또한정리한다 핵심작업 순서 출력 전에.

// 읽기 정리한다 핵심프로그램 형태 계산 중에명확.

var abk;
		function ex(a, b) {
	if (abk[a] % 2 == 1) -- abk[a];
abk[a] /= 2
  abk [ b ]+= abk[a];
  }      // 읽기 정리한다 로컬프로그램 형태 계산 중에가까이.
    function Main(input ) {
 abk = input.split("\n")[0].split(/\s/).map(function(value) { return value - 0; });
       var K = abk[2];


 for (var n =  1; n  <= K;  n++) {
   if(n  % 2 == 1) ex(0, 1);   
else ex(1,0);
}
/*
 * 읽기 정리한다 로컬평가 순서 시작에서명확.
 * 읽기 잘정리한다 현재코드 연속성 입력과 함께내부.
 */

/* 읽기 지금정리한다 현재예상 출력 시작에서가까이. */
    console.log('%d %d', abk[0], abk[1]);  
        }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
