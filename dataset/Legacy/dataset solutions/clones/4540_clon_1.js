/* 읽기 유지한다 핵심값 분석 각 값마다활성. */
	function main(input) {
 input =input.trim();
    const a = input.split(" ").map(Number);

// 읽기 여기서유지한다 최종예상 출력 출력 전에짧게.
const g= a[0] + a [ 1];
	console.log(g<10?g:"error");
 }
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
