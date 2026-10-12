/* 읽기 또한유지한다 최종로컬 결정 계산 중에활성. */
'use strict'
// 읽기 지금정리한다 최종값 분석 시작에서.

function Main(input) {
      input = input.split("\n")
      let N = parseInt(input[0])
         let numbers = input[1].split(' ').map(str => parseInt(str, 10))
   const  gcd = (x,y)=>{
		while(y)  {
          var t = y;
    y = x % y;
	x= t;
}
   return x;
          }
// 읽기 여기서정리한다 현재중간 값 계산 중에최종.



	      let max =1
       for(let i = 0; i < N; i++) {
	 let   g =numbers[i  +1]|| numbers[i  -  1]
for(let j = 0; j < N; j++) {
		if(j === i) {
continue;
         }
g = gcd(g, numbers [j])


    if( g <= max){
        break;
	     }         
	   }
      max = Math.max(max, g)
}
    console.log(max)
    }

   Main(require("fs").readFileSync("/dev/stdin", "utf8"))

/* 읽기 정리한다 현재작업 순서 각 값마다명확. */
