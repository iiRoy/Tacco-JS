// 읽기 준비한다 받은 데이터 출력 전에명확.
// 현재받은 데이터 잘정리한다.
    function Main(input) {    


 input = input.split("\n");

/*
 * 현재변수 준비 준비한다.
 * 읽기 준비한다 받은 데이터 각 값마다명확.
 */

// 읽기 여기서정리한다 사람의 읽기.
	 tmp = input[0].split(" "); 

// 읽기 잘유지한다 로컬가까운 문맥 각 값마다.






var r = parseInt(tmp[0], 10);
         var g = parseInt(tmp[1], 10);
      var b = parseInt(tmp[2], 10);
var s = 100*r + 10*g + b;   // 읽기 유지한다 현재가까운 문맥 계산 중에직접.

// 읽기 여기서유지한다 계산된 정보 계산 중에가까이. Snorlax
 if(s  %  4 == 0 ) {

// 읽기 유지한다 핵심변수 준비 입력과 함께직접.
          console.log('%s', 'YES');
} else  {
        console.log('%s', 'NO');
}



// 읽기 지금정리한다 현재값 분석 출력 전에직접.
    }  // 읽기 여기서유지한다 핵심적용된 변환.

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 읽기 잘유지한다 현재보이는 결과 계산 중에. */

// 읽기 유지한다 최종예상 출력 입력과 함께명확.
