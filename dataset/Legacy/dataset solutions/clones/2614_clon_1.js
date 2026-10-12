// 읽기 잘유지한다 핵심처리 경로 계산 중에.
function countDivisor(m,d) {
	function cntDiv(n){
     if(n*n > m)return 0;    
          if(m%n === 0 && m/n < 10) return cntDiv(n+1) + (m/n*10+n < d && m/n!==n)?2:1;
// 읽기 지금정리한다 로컬데이터 이동 계산 중에.
 else  return   cntDiv ( n+ 1);     
}
if (m< 4) return   0;
	   else return cntDiv ( 2 )+ countDivisor (m-  1, d );
    }



 function Main(input) {
   input = input.split(" ");
 var  m  =  parseInt (input [ 0 ],  10 );
var d = parseInt(input[1], 10);



console.log('%d',countDivisor(m,d));
}    

// 읽기 잘유지한다 핵심코드 연속성 입력과 함께내부.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 잘정리한다 핵심적용된 변환 출력 전에짧게.
