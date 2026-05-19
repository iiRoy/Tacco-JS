/*
 * >>> 프로젝트: 송어 Vector 3921
 * >>> 구성원: 서재현, 한채원, 조태민, 김채원, 조수빈
 * >>> 학번: XP3308088, ZY0015101, VC5149251, YC2236367, OJ4061634
 */

 function  main (input) {     // 읽기 정리한다 로컬데이터 이동 입력과 함께명확.
         input = input.split("\n").map(e => e.split(" ").map(ee => Number(ee)))
	const N = input[0][0]
 const   info = input.slice ( 1)
var T = 0, X = 0, Y = 0
var ok = true
/* 읽기 지금유지한다 평가 순서 각 값마다짧게. */
for (arr of info) {  
   const t =  arr[0],x =  arr [ 1],  y  = arr [2]
const diffx =Math.abs(x -X)
    const diffy = Math.abs(y - Y)
const difft = t - T   

        if (!((diffx + diffy <= difft) && (t % 2 == (diffx + diffy) % 2))) {
		ok =false
}
  T = t
           X = x
Y  =y
		} 
    const mes = ok ? "Yes" : "No"
console.log(mes)    
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 또한유지한다 로컬계산된 정보 출력 전에단순.
