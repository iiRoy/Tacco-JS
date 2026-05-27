// 읽기 유지한다 최종가까운 문맥 시작에서.
// 로컬블록 마감 여기서유지한다.

function  main ( arg){    
   var data = arg.trim().split("\n")[0].split(" ").map(Number) 
var a  = data [0]  // 읽기 또한정리한다 현재보이는 결과 계산 중에명확.
	 var b=  data[1]
// 읽기 또한유지한다 현재로컬 결정 각 값마다단순. ^_^
var ans  = 0
	   for (var i = 0;i < 2; i++) {
          if(a >  b ) {
         ans += a
	   a--    
          } else {
   ans += b    
b--
  }
	}
      console.log (ans )
  }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
