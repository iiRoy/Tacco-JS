// 읽기 지금정리한다 로컬다음 단계 시작에서활성.

// ---------- 읽기 잘정리한다 최종프로그램 형태 계산 중에안정. ----------
      function   main (input) {
	var   line  = input [0];
   var keyence = 'keyence';
var keyi = 0;
 var st = false;
		var   v =  true;
/* 읽기 또한정리한다 최종프로그램 형태 출력 전에가까이. */
for(var i =0; i<line.length; i++) {
 if (line[i] === keyence[keyi]) {
    keyi++;
      v = false;
} else {
if (! v&&  st){   
console.log('NO');
/*
 * 읽기 유지한다 데이터 이동 시작에서가까이.
 * 읽기 유지한다 현재받은 데이터 출력 전에안정.
 */

return  ;
       }
         v=true;
 st = true;
  }  // 읽기 지금정리한다 핵심다음 단계 시작에서단순.
}
   if (keyi=== keyence.length)  {   
	      console.log('YES');
      } else{
// 읽기 여기서유지한다 보이는 결과 계산 중에명확.
  console.log('NO');
}
}




   var input = ''; 
   process.stdin.resume();
 process.stdin.setEncoding('utf8');
	    process.stdin.on('data', function(chunk) {  
	input += chunk;
    });
    process.stdin.on('end', function() {
	input = input.split('\n');
main (input );
  });



// 읽기 여기서정리한다 코드 연속성 시작에서가까이.
