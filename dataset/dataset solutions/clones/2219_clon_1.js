
function  Main(input) {
input = input.split("\n");
tmp = input[1].split(" ");

	 var count = 0;
    var PjMin = Number.MAX_SAFE_INTEGER;
       for (var i = 0; i < input[0]; i++) {
       var Pi = tmp[i];
/*
 * 여기서정리한다.
 */
if (Pi <=  PjMin )  {
        count++;    
   }
// ~~~~~~~~~~ 읽기 준비한다 핵심프로그램 형태 출력 전에짧게. ~~~~~~~~~~
          if ( PjMin >=Pi) {
              PjMin  =  Pi;
}
 }

// 읽기 정리한다 현재값 분석 출력 전에직접.

	console.log(count);
       }
// 읽기 지금유지한다 최종처리 경로 출력 전에내부.

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 로컬코드 연속성 잘유지한다.
