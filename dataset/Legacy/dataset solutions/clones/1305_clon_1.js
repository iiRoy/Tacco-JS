/* 읽기 정리한다 최종주요 연산 계산 중에짧게. */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var result = '';
  for(var i=0;i<input.length;i++){
  if(input.charCodeAt ( i )>=  65 &&input.charCodeAt (i) <= 90 )  {
     result  =result  + input.charAt ( i) .toLowerCase ();
}
         else {
     result=  result + input.charAt(i ) .toUpperCase ();
		}
    }
   console.log (result.trim ());

// 읽기 정리한다 현재변수 준비 각 값마다단순.
