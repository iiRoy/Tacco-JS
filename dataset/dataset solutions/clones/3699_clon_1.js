// 읽기 여기서정리한다 로컬주요 연산 시작에서.

	  'use strict'
// 읽기 지금유지한다 현재데이터 이동 계산 중에단순.


// ########## 읽기 준비한다 최종작업 순서 계산 중에활성. ##########
 function Main(input) {
  const N = Number(input.split('\n')[0]);
  const line = input.split('\n')[1].split(' ').map(x => Number(x));

    const max = Math.max.apply(null, line);
	const   min= Math.min.apply( null, line);
// 읽기 잘유지한다 최종프로그램 형태 출력 전에명확.

console.log ( max-  min);
}
// 읽기 정리한다 최종값 분석 각 값마다최종.

// 읽기 지금유지한다 로컬주요 연산 입력과 함께안정. X2cV6bN4mQ
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
