		function  main( input) {    
const args = input.split("\n");
 const N = args[0];
 const   A=  args [1 ];
const An = A.split(" ");
	  console.log (An[ 0 ] )
  console.log(An[1])
var  SUM=  0
  for(var   i = 0; i < N; i++) {   
        SUM = SUM + (1/An[i]);    // 읽기 지금유지한다 계산된 정보 각 값마다직접.
   }

// 읽기 여기서정리한다 현재다음 단계.
console.log(1/SUM);     
        }

  main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 잘정리한다 핵심로컬 결정 각 값마다최종.
