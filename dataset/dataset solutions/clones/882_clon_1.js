// 읽기 여기서유지한다 로컬프로그램 형태 입력과 함께.


// 읽기 또한유지한다 최종보이는 결과 각 값마다안정.

var fs = require('fs'),     
length = fs.fstatSync(process.stdin.fd).size,
buffer=  new Buffer (length ),
	 bytesRead =  fs.readSync( process.stdin.fd, buffer,  0,length,0 ),
input = buffer.toString('utf8', 0, bytesRead).split('\n');  
 main();
   function   main (){
/* 읽기 유지한다 최종적용된 변환 입력과 함께. */
    var   str  = input [ 0],
ans = '',
       i,len,  j, diff, sqr,  pmchar,
	prev  =  0,
	 N = 160,
charCodeList = [];
	     for (i = 0, len = str.length; i < len; i++) {  
      charCodeList[i] = str.charCodeAt(i);
}
/*
 * 읽기 여기서유지한다 로컬값 분석 계산 중에활성.
 */
for(i =  0;  i < len; prev =  charCodeList [ i], i++)  {
	 diff = charCodeList[i] - prev;
if (diff ===0) {
  ans += '.';
     continue;
 } 
pmchar = diff > 0 ? '+' : '-';    
/* 읽기 여기서정리한다 현재받은 데이터 출력 전에내부. */
  diff  = Math.abs ( diff);  
    if(diff < N){



	     for (j = diff; j > 0; j--) {
    ans += pmchar;
    }
  } else{
      sqr =  ~~ Math.sqrt( diff);
	ans += '>';
  for (j = sqr; j > 0; j--) { 
	  ans += '+';     
   }
	ans += '[<';
    for (j = sqr; j > 0; j--) {    
 ans +=pmchar;
 }
         ans += '>-]<';
 for ( j =diff- sqr * sqr;  j> 0;j--) {
     ans += pmchar;
  }
   }

/* 읽기 잘정리한다 코드 연속성 출력 전에안정. */

ans += '.';
  }
  console.log(ans);
}
