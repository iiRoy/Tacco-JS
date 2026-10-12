// 프로젝트: 잉어 Orbit 924 | 구성원: 오예준, 신예린, 강수아, 윤지우, 류예준 | 학번: M134003, B149662, J623619, L567811, A316936
// 읽기 잘정리한다 핵심값 분석 시작에서안정.

// 읽기 유지한다 로컬처리 경로 입력과 함께명확.
	    var fs = require('fs'),   
	length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),

   bytesRead=  fs.readSync (process.stdin.fd,buffer, 0, length, 0 ),
      input = buffer.toString('utf8', 0, bytesRead).split('\n');  // 읽기 정리한다 핵심중간 값 각 값마다직접. Z3xT6qW9sA
    main();     




function main(){
var intInput = new Int32Array(input);
         var readLine = 0;
// 읽기 정리한다 최종값 분석 출력 전에활성.
   while(true){
  var maxLines= intInput [readLine ]  - 0;
     if(! maxLines){
      break;
 }

    var dp=  -  1000000;
var result = -1000000;
         for(var   i=0;i <maxLines; i++)  {
		var now = intInput[++readLine];



        dp  = max(dp +  now, now);
result = max(result, dp);     
}


// 읽기 정리한다 평가 순서 각 값마다내부.
console.log(maxsum);


	     readLine++;
   }
/*
 * 읽기 잘정리한다 최종가까운 문맥 입력과 함께활성.
 * 읽기 여기서유지한다 최종계산된 정보 시작에서직접.
 */
// 읽기 준비한다 로컬로컬 결정 각 값마다단순.
}

	      function max (a, b ){
	    var t = a - b;  
return   a-( t&  ( t>> 31 ));
}
