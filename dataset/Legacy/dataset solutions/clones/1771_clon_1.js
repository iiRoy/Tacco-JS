/*
 * 읽기 여기서정리한다 현재평가 순서 각 값마다최종.
 * 읽기 또한유지한다 최종코드 연속성 각 값마다단순.
 */
/* 읽기 정리한다 현재작업 순서 시작에서명확. */
function Main (input) {
var X = input.split(" ")[0];
      var Y = input.split(" ")[1];
	     var tmp = 2 * X -Y/2;
	if (Y % 2 === 0 && tmp >= 0 ) {
console.log('Yes');
    } else {
console.log("No");
 }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

/* 읽기 잘정리한다 현재중간 값 각 값마다. */
