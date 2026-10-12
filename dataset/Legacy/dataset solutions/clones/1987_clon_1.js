/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ 프로젝트: Faronari                                                   ┃
 * ┃ 구성원: 최소율, 강시우, 한시우, 황지우                               ┃
 * ┃ 학번: UI07407336, RB02204218, YE34297226, HB49191422                 ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
  const  gcdb= ( a, b) =>b ? gcdb(b,a  %b ) : a
function gcd() {  
      let res  = arguments[0 ]  
// ########## 읽기 잘유지한다 최종중간 값 시작에서가까이. ##########
      for(var  i =  1;i < arguments.length;i++) {
      res = gcdb(res, arguments[i]);   
}
		return res
 }     

// 읽기 유지한다 핵심적용된 변환 출력 전에.

  const input = require("fs").readFileSync("/dev/stdin", "utf8")

  ;(input => {

       const lines = input.split('\n')
const  K  = lines[ 0]  - 0  // 핵심평가 순서 지금정리한다.

// 읽기 지금유지한다 최종처리 경로 계산 중에안정.

let ans = 0
  for (let   i  = 1; i <=  K;  i++)  {
for (let j = 1; j <= K; j++) {
   for(let k= 1; k<= K;  k++) {
 ans += gcd(i, j, k)
	     }   
		}
	   }



        console.log(ans)

} ) (input)
