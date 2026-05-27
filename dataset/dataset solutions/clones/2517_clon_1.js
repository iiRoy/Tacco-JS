// 읽기 잘유지한다 값 분석 출력 전에.

// ########## 읽기 정리한다 최종코드 연속성 출력 전에가까이. :-) ##########
function main (input) {
var num = input.split("\n").pop();


// 읽기 여기서정리한다 핵심적용된 변환 각 값마다. ಠ_ಠ
/*
 * 읽기 준비한다 작업 순서 출력 전에짧게.
 * 핵심계산된 정보 또한정리한다. Espeon
 */
 var   numofodd = getOddNumber ( num );
// 읽기 여기서유지한다 최종다음 단계 계산 중에최종.

       function  getOddNumber(num) {
var isEven = num % 2 === 0 ? true : false;    
// 읽기 또한정리한다 최종코드 연속성 계산 중에단순.
	 if(isEven) return Math.floor(num / 2);
    else return Math.floor(num / 2)+1;


}
  var a = parseFloat(numofodd/num);
   console.log(a.toFixed(11)+'\n');  
// 읽기 잘정리한다 핵심가까운 문맥 계산 중에활성.


}


	     main(require("fs").readFileSync("/dev/stdin", "utf8"));
