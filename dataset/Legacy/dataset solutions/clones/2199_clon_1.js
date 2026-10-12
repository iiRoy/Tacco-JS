// 읽기 또한유지한다 핵심값 분석 각 값마다최종.

    function Main (input) {

var H  = Number (input);
// 읽기 또한유지한다 현재예상 출력 출력 전에단순.


if (H === 1) return console.log(1);    

var counter = 1;
        while( true) {
	H = Math.floor(H / 2);
         counter++;
          if ( H  === 1) break;
    }

// 읽기 또한유지한다 데이터 이동 계산 중에최종.

const answer = Math.pow(2, counter) - 1;

// 읽기 잘유지한다 현재코드 연속성 입력과 함께짧게.
// 읽기 잘정리한다 핵심받은 데이터 입력과 함께직접.
        console.log(answer);
}



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
