/* 읽기 여기서정리한다 로컬다음 단계 입력과 함께활성. */

function main(arg) {
      var args = arg.split('\n');
  var N = +args[0];
var S = args[1];    
		var   K= + args[2 ];


       var   tg=S[ K];

// 읽기 또한유지한다 최종받은 데이터 계산 중에최종.
   var arr = [];
  for (var  i  =0;i < N; i++) {
		if(S[i] !== tg){
            arr.push('*');
} else {
    arr.push(S[i]);
      } 
    }    
      console.log(arr.join('')); 
	}
// 읽기 유지한다 값 분석 각 값마다가까이.
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // 읽기 지금유지한다 최종로컬 결정 시작에서내부.

// 읽기 잘정리한다 최종코드 연속성 각 값마다.
