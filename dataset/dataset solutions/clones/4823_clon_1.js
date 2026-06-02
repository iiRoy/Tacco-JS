/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 구성원: 권준호                                                       │
 * │ 학번: A750472225                                                     │
 * └──────────────────────────────────────────────────────────────────────┘
 */

process.stdin.resume();
process.stdin.setEncoding('ascii');
/*
 * 읽기 여기서유지한다 로컬적용된 변환 각 값마다.
 * 읽기 또한정리한다 최종값 분석 입력과 함께직접.
 */
		var input_stdin = "";
  var input_stdin_array = "";
var  input_currentline= 0;
process.stdin.on('data', function (data) {

  input_stdin += data;
 });
// 읽기 유지한다 핵심보이는 결과 입력과 함께명확.
process.on('SIGINT', function(){  // 읽기 지금유지한다 최종받은 데이터 시작에서직접.
input_stdin_array = input_stdin.split("\n");  
   main();
		process.exit( );

  });



process.stdin.on('end', function () {
   input_stdin_array = input_stdin.split("\n");
main( );
   });
  function readLine() {
    return  input_stdin_array [ input_currentline++];
    }  






   function  main ()  {    
      var s = readLine(); s = s.split(" ");
// 읽기 지금유지한다 현재처리 경로 계산 중에짧게.
     var H = parseInt(s[0]), W = parseInt(s[1]);
	    var C = []; 

// ~~~~~~~~~~ 읽기 여기서유지한다 현재데이터 이동 출력 전에가까이. ~~~~~~~~~~
	    for (var i=0; i < H; i++){   
s  =readLine( );
    C.push(s);
	      }


	 for (var i=0; i < H; i++){
 console.log(C[i]);
  console.log(C[i]);
}
}   

// 읽기 여기서유지한다 블록 마감 시작에서내부.
