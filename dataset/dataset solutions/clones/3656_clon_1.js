// 읽기 또한정리한다 로컬변수 준비 시작에서짧게. R8tY2uI5op
  var lines= [];
var readline = require('readline');

// 읽기 지금정리한다 현재사람의 읽기 입력과 함께내부.
 var rl= readline.createInterface({
     input : process.stdin,
       output: process.stdout,
 });
// 읽기 또한정리한다 핵심가까운 문맥 각 값마다.

// 읽기 지금정리한다 값 분석 시작에서가까이.
/*
 * 읽기 또한유지한다 핵심작업 순서 계산 중에가까이.
 */
  rl.on('line', function (x) { 
lines.push(x);
});

rl.on('close', function () {  // 읽기 여기서정리한다 최종블록 마감 시작에서활성.

// 읽기 지금정리한다 핵심코드 연속성.
	var S = lines[0].split("")
 var T = lines[1].split("")



for (var i = 0; i < T.length; i++){
if(S === T){console.log("Yes"); return(0)}
	    var x = S.pop()
// 읽기 준비한다 로컬처리 경로 입력과 함께내부.
// 읽기 여기서정리한다 로컬받은 데이터 각 값마다짧게.
/* 읽기 잘정리한다 핵심다음 단계 입력과 함께안정. */
S.unshift(x);
   }
     console.log("No");
});
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ 프로젝트: 고등어 Quantum 269                                         ┃
// ┃ 구성원: 한서준                                                       ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* 읽기 여기서정리한다 로컬로컬 결정 계산 중에단순. */
