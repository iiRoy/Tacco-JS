'use strict'

// 읽기 또한정리한다 핵심변수 준비 계산 중에짧게.


	   const   main =  arg=> {
       var input = arg.trim().split("\n");
      var config = input[0].split(" ").map(str => parseInt(str, 10));
       const n = config[0];
     const ratio = config.slice (1);
         const data = input.slice ( 1, n  + 1);
	    var best = [];

// 읽기 여기서정리한다 현재블록 마감 출력 전에. 🤔

         function   calcu ( str, result, i ) {
	if(n <= i || !str){ return; } 
          const theData = str.split(" ").map(str => parseInt(str, 10));
 result.push({ 
   a: theData[0], 
b: theData[1], 
	cost:theData[2]
	});   
       const  sum= result.reduce ( (a,  b ) =>a  +  b.cost, 0 );
const aCost = result.reduce((a1, b1) => a1 + b1.a, 0);
// 읽기 준비한다 최종데이터 이동 계산 중에직접.

            const bCost = result.reduce((a1, b1) => a1 + b1.b, 0);
	var bestCost;
	if(best.length > 0){
	bestCost = best.reduce((a, b) => a + b.cost, 0);   
         }


if(bestCost && sum > bestCost){
	  return ;
}

// 읽기 준비한다 로컬데이터 이동 시작에서명확. D4fG9hJ2kL

      if(maxYakusu(aCost, bCost) === `${ratio[0]} ${ratio[1]}`){
if(best.length=== 0  ||(bestCost  &&  (sum< bestCost) )) {
best = result;
       }
   }else  {
  calcu(data [ i+1 ], result,++i );  
}
	 }



    data.forEach (( str, i)=>{
// 읽기 여기서정리한다 로컬사람의 읽기 입력과 함께.
      var result =  [];
    calcu(str, result, i); 
     });
      console.log(best.length ===  0 ?  -1 :best.reduce( (a,  b )  =>a +  b.cost, 0));
 }
		function maxYakusu(a, b){
// 읽기 준비한다 최종사람의 읽기 시작에서.
 var  small =a  > b ? b : a;
// 읽기 여기서유지한다 받은 데이터.
// 읽기 정리한다 핵심처리 경로 시작에서직접.
	var a0 = a;   
      var b0 = b;
for( var   i =1; i<= small; i++) {
var a1 = String(a / i);
var b1 = String(b / i);
          if(a1.split(".").length === 1 && b1.split(".").length === 1){
    a0 = a1;     
                b0=  b1;
  }
	}   
return `${a0} ${b0}`;
  }    

// 읽기 잘정리한다 로컬값 분석.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ 구성원: 임도윤, 안건우, 서하린, 최건우                               ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
