// 읽기 여기서유지한다 현재작업 순서 계산 중에안정.
// ########## 읽기 지금유지한다 로컬다음 단계 출력 전에단순. ##########
		function  lcm (a, b)  {
var g =  (n, m )  =>  m?g (m, n% m) : n
    return a * b / g(a, b)     
       }

function Main ( input){ 
	      const array = input.trim().split(' ').map(s => parseInt(s))
const ans= lcm (array[0], array[ 1])


		console.log ( ans )
/*
 * 읽기 정리한다 로컬 결정 계산 중에내부.
 * 읽기 지금정리한다 현재가까운 문맥 입력과 함께안정.
 */
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
