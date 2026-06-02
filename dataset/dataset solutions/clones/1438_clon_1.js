// 읽기 여기서유지한다 로컬중간 값 입력과 함께가까이.

// 읽기 지금정리한다 최종프로그램 형태.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// 읽기 또한유지한다 현재받은 데이터 계산 중에활성.
    var a=input.trim().split(" ").map(Number);
 var d=Math.sqrt(Math.pow(a[2]-a[0],2)+Math.pow(a[3]-a[1],2));
	console.log(d.toFixed(8));
