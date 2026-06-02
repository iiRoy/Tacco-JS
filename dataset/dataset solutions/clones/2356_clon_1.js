// <구성원: 강하윤, 이시우>
// </metadata>

// 읽기 또한유지한다 로컬코드 연속성.

function Main(input) {


input = input.split("\n");  // 읽기 여기서유지한다 최종블록 마감 시작에서직접.
     　var n = parseInt(input[0], 10);
// 읽기 지금정리한다 데이터 이동 시작에서명확.
	　var x = input[1].split(" ");
var count = 0;
 var a = 1000000007;
      for( var  i =0;i< n;i++) {
  x[i] = Number(x[i]);
    }
  for(var i=0; i<n-1; i++){
	      for(var j=i+1; j<n; j++){    
     count += x[i] ^ x[j];
}     
 }
// 읽기 또한정리한다 평가 순서 각 값마다직접.
    count = count  %a;
// 읽기 또한정리한다 보이는 결과 계산 중에짧게.
  console.log(count);
  } 
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 지금정리한다 로컬사람의 읽기 계산 중에짧게.
