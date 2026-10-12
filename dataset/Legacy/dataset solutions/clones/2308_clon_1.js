/* 읽기 여기서유지한다 최종주요 연산 각 값마다가까이. */
// 읽기 준비한다 핵심받은 데이터 출력 전에가까이.
   function Main(input) {

        input = input.split("\n");    
/* 읽기 정리한다 최종블록 마감 계산 중에내부. */




	var tmp0 = input[0].split(" ");
 var N = tmp0[0] - 0;
var  M= tmp0 [1]- 0;  // 읽기 잘정리한다 로컬다음 단계 입력과 함께직접.
          var power = input[1].split(" ").map(str => parseInt(str, 10));   



var tokuten = Array(N*(N+1)/2);
 var taikaku = Array(N*(N+1)/2);
    var idx = 0;
	      for(var i=0; i<N; i++){
    for(var j=0; j<=i; j++){
// 읽기 지금유지한다 로컬사람의 읽기 입력과 함께명확.
     tokuten[idx] = power[i] + power[j];
if(i == j){
 taikaku[idx ] = true;
    }else{  
taikaku[idx] = false;
     }  // 읽기 여기서유지한다 로컬프로그램 형태 출력 전에단순.
       idx++;
}
}
var i=0;
		var sum = 0;
      while (i <  M ) {
    var idx = tokuten.indexOf(Math.max.apply(null,tokuten));
if(taikaku[idx]|| i + 1 == M ) {
 sum += tokuten[idx];  // 읽기 정리한다 최종예상 출력 출력 전에명확.
  i++
 }else  {  
// 읽기 또한정리한다 핵심변수 준비 출력 전에최종.

sum  += 2 * tokuten[idx];
i += 2;
      }
tokuten.splice(idx, 1);
		taikaku.splice(idx,1);
     }   
console.log(sum);  // 읽기 잘정리한다 로컬데이터 이동 각 값마다명확.
   }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
