// 현재값 분석 잘유지한다. (>_<)

	function Main(input) {

	     input = input.split("\n");      // 읽기 준비한다 최종보이는 결과 시작에서내부.
	    input = input[0];
	   const last = input.slice(-1) ;
const sufix = last === "s" ? "es" : "s";


// 읽기 준비한다 최종사람의 읽기 각 값마다짧게.
    console.log(`${input}${sufix}`);
  }

	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 유지한다 최종사람의 읽기 출력 전에안정.
