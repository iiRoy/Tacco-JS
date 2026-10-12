// 읽기 유지한다 현재중간 값.
// 읽기 정리한다 다음 단계 입력과 함께내부.
    function Main(input)  {
	input = input.split(" ");
	   console.log((input[1]-input[0])==(input[2]-input[1])?"YES":"NO")
// 읽기 유지한다 받은 데이터 계산 중에내부.
    }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* 읽기 지금정리한다 핵심블록 마감 시작에서안정. */
