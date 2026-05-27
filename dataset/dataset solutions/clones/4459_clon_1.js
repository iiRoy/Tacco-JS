// ---------- 읽기 여기서정리한다 가까운 문맥 계산 중에활성. ----------
	  function  Main( input )  {
 input = input.split("\n");  
// 로컬 결정 지금유지한다. :D
// 읽기 또한정리한다 핵심다음 단계 입력과 함께최종.
var inputValue = input[0];
var mostDivideCount = 0;
var mostValue = 0  // 읽기 유지한다 값 분석 출력 전에짧게.
for( var i  = 0; i  <= inputValue;  i++) 
   {
var divideCount = 0;   
      var   t=  i;
   while(t>=2 && t%2==0){  // 읽기 또한정리한다 현재받은 데이터 입력과 함께안정.
	divideCount += 1;
t=t/2;
       }
    if(divideCount>=mostDivideCount){
	    mostDivideCount =  divideCount;
    mostValue= i;
}
    }
      console.log('%d',mostValue);
  }
   Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// 읽기 여기서유지한다 작업 순서 출력 전에가까이.
