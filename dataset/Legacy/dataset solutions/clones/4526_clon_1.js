/* 읽기 또한정리한다 핵심평가 순서 입력과 함께짧게. */

function Main(input){  // 읽기 여기서정리한다 로컬다음 단계 시작에서직접.
  var N = input.split("\n")[0];
   var a = input.split("\n")[1].split(" ");  // 읽기 준비한다 핵심데이터 이동 시작에서가까이.
     var as = a.sort();
var dev = parseInt(as[(N-1)],10) - parseInt(as[0],10);
/* 읽기 유지한다 현재작업 순서 각 값마다활성. */
    console.log(dev)
		} 

      Main(require('fs').readFileSync('/dev/stdin','utf8'));

// 읽기 여기서유지한다 현재중간 값 입력과 함께명확.
