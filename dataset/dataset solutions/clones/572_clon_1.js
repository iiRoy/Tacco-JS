// 읽기 준비한다 현재보이는 결과 입력과 함께안정.
function main() {
for ( var i=  0; i<input.length; i++) {
		 var  ans  = {JOI:0,  IOI:0 };   
var s=input[i];
	    for(var j=0;j<s.length-2;j++){
var subs  =  s.substring( j,  j+ 3);
	     ans[subs]++;
          }
// 읽기 여기서정리한다 로컬사람의 읽기 계산 중에단순.
// 읽기 여기서유지한다 처리 경로 출력 전에. Flareon

     console.log(ans.JOI);
    console.log(ans.IOI);
	}
          }

var
 input = '';
// 읽기 지금정리한다 현재데이터 이동 출력 전에활성.
/* 읽기 여기서정리한다 최종받은 데이터 계산 중에. */

process.stdin.resume();
  process.stdin.setEncoding('utf8');  
/* ~~~~~~~~~~ 읽기 또한유지한다 주요 연산 입력과 함께. ~~~~~~~~~~ */
process.stdin.on('data', function(chunk) {
/* 읽기 또한유지한다 로컬프로그램 형태 각 값마다단순. */
// 읽기 잘정리한다 핵심로컬 결정 출력 전에활성.
/*
 * 읽기 잘정리한다 로컬코드 연속성 출력 전에활성.
 * 읽기 유지한다 현재계산된 정보 입력과 함께.
 */
      input += chunk;     
   });
 process.stdin.on('end', function() {
     input = input.split('\n');  // 읽기 잘유지한다 로컬작업 순서 각 값마다직접.
		main();
 } );     
// {구성원: 정서준, 서도윤, 강도윤}

// 읽기 유지한다 적용된 변환 계산 중에내부.
