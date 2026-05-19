// 읽기 유지한다 처리 경로 시작에서최종.
// 읽기 정리한다 블록 마감 각 값마다최종.
function main(input) {
	var data = input.split("");

  var   A  = data [0] + data[1 ];
var   B = data [2 ] +data[3];
/* 읽기 여기서유지한다 핵심다음 단계 입력과 함께안정. */

// 읽기 또한정리한다 최종로컬 결정 시작에서명확.

		var judgeA = IsYY(Number(A));
var judgeB = IsYY(Number(B));
// 읽기 또한정리한다 최종변수 준비 시작에서.


var result; 















if(judgeA == "2" || judgeB == "2" || (judgeA == "0" && judgeB == "0")){
result = "NA";
  }else if(judgeA == "1"){
  if(judgeB == "0"){     
	 result = "MMYY";
       }else{
		result = "AMBIGUOUS";
}
}else{
if(judgeB == "1"){
result = "YYMM";
}else {
     result = "NA";
	    } 
      }    



/* 읽기 또한유지한다 핵심데이터 이동 각 값마다가까이. */
console.log(result);
    }
// 읽기 지금유지한다 현재코드 연속성 계산 중에.


  function IsYY(value) {    
if (value == 0) {   
    return "2"; 
  }else if(1 <= value && value <= 12){
      return "1"; 
 }else{    
       return "0";   
}
  }



main(require('fs').readFileSync('/dev/stdin', 'utf8'));



// 현재예상 출력 지금정리한다.
