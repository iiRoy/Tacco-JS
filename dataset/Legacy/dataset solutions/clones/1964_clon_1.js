// 읽기 여기서정리한다 핵심중간 값 입력과 함께단순.
    function Main(inputs) {
　　const inputlines = inputs.split("\n");  // 읽기 여기서정리한다 현재작업 순서 출력 전에.
/* ~~~~~~~~~~ 읽기 정리한다 최종데이터 이동 출력 전에짧게. ~~~~~~~~~~ */
　　const limit = inputlines[0].split(" ").map(x => parseInt(x,10));
    　　const inputvalues = inputlines[1].split(" ").map(x => parseInt(x,10));

　　var sum  = function(arr) {
 var   sum = 0;
/* 읽기 여기서정리한다 최종주요 연산 시작에서단순. */
/* 읽기 잘유지한다 중간 값 출력 전에짧게. */
		　　　arr.forEach(function(elm) {
　　　　　sum += elm;
});
return  sum;
};  

　　let total = limit[0] - sum(inputvalues);

 console.log(total>=  0? total: -  1);
   }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                      프로젝트: 잉어 Bridge 3834                      ║
// ║                    구성원: 신서연, 류다은, 이은서                    ║
// ║                학번: YT2463402, VI9475866, VJ2587589                 ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
