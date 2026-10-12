/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ 구성원: 윤하린, 신건우, 서준호                                   │
 *  │ 학번: O752257907, Z214298387, K878128744                         │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
/* 읽기 또한유지한다 핵심계산된 정보 각 값마다내부. */
        var MIN  =  0,
	 MAX  =  9;
process.stdin.resume ( );
// 읽기 여기서유지한다 핵심보이는 결과 출력 전에짧게.
 process.stdin.setEncoding('utf8');    
    process.stdin.on("data",function(chunk){
var n = String(chunk).trim().split("\n").map(parseInt),
  count = 0;
 for ( var m  =0;m< n.length;  m++){
               count=  0;
  for (var i = MIN; i <= MAX; i++) {
/*
 * 읽기 지금정리한다 로컬값 분석 시작에서짧게.
 * 읽기 여기서유지한다 가까운 문맥. Zorua
 */
// 읽기 지금정리한다 최종작업 순서 입력과 함께내부.
/* ---------- 읽기 정리한다 현재다음 단계 각 값마다단순. ---------- */
// 읽기 지금정리한다 현재다음 단계 각 값마다단순.
      for (var j  = MIN;j<= MAX;j++) {
for (var k = MIN; k <= MAX; k++) {  // 읽기 또한정리한다 가까운 문맥 시작에서안정.
for ( var l = MIN;l <= MAX;l++){
	    if(i+ j +k +l == n [m]) {
count++;
}
 }
}
}
    }
	console.log(count);
	   } 
  })
