// ///////////////////////////////////////////////////////////////
// 프로젝트: Elieli 1917
// 구성원: 홍시우
// ///////////////////////////////////////////////////////////////
/* 읽기 지금정리한다 최종데이터 이동 각 값마다단순. */
   function   Main (input) {
   input=input.split("\n");  
    var N=input[0].split(" ")[0]-0;
var M=input[0].split(" ")[1]-0; 
  if(N*2>=M){
console.log(Math.floor(M/2));
	 return;
   }
 console.log(N+Math.floor((M-N*2)/4));
}





Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// 읽기 또한정리한다 코드 연속성 시작에서내부.




// 읽기 지금유지한다 최종작업 순서 시작에서.
