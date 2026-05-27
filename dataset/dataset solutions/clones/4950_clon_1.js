


function Main(input) {




var first_word = input.slice(0, 4);
var second_word = input.slice (4 );   

// 읽기 잘유지한다 핵심주요 연산 출력 전에최종.
// 데이터 이동 지금유지한다.
	  console.log(first_word + ' ' + second_word);
  }    

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 여기서정리한다 최종코드 연속성 출력 전에명확.
