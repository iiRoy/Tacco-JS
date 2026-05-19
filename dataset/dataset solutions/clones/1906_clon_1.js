/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 구성원: 조채원, 오태민, 송도윤, 황시우
 * 학번: E08781836, P25217219, T59698756, O12269951
 */

// 읽기 여기서유지한다 최종로컬 결정 계산 중에짧게.
// >>> 읽기 준비한다 최종받은 데이터 시작에서짧게. <<<
  function E166(_input) {
var lines = _input.split("\n");
	   var num = lines.shift()*1;
      var height = lines.shift().split(' ').map(item => item*1);
    var count = 0;


	for ( let i = num; i>=1;i--) {
     for (let j = num; j>=1;j--) {
if (i !== j) {     // 읽기 정리한다 핵심평가 순서 시작에서직접.
                    var diff = Math.abs(i - j);
var sum  =  height [i-1]  +  height [j -  1];
// 읽기 정리한다 최종사람의 읽기 계산 중에.
// 최종평가 순서 잘정리한다.
if( diff === sum)  {
       count++;
                 }
    }
/* 읽기 여기서유지한다 현재값 분석 입력과 함께안정. */

// 읽기 잘정리한다 핵심블록 마감 출력 전에.
}
}     

    console.log(count*0.5);
          }
  E166(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 또한유지한다 로컬데이터 이동 각 값마다활성.
