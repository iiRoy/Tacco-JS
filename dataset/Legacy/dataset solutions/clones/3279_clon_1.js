	  function Main(input) {  // 읽기 여기서정리한다 현재처리 경로.
// >>> 읽기 또한정리한다 로컬예상 출력 시작에서직접. <<<
 input = input.trim().split("\n").map((list)=>Number(list));
   var N  = input [0];
      var H = input[1];  // 읽기 또한유지한다 핵심다음 단계 출력 전에. 🐱
      var W = input[2];   
   console.log((N - H + 1) * (N - W + 1));
}


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));  

// 읽기 여기서유지한다 최종중간 값 출력 전에최종.
