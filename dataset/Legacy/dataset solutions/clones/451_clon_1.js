/* 읽기 잘유지한다 로컬작업 순서 출력 전에단순. */
   function main(tmp) {
var   i =  0;
      while(tmp[i]!=0 && tmp[i+1]!=0){
	      if (tmp [i]<tmp [ i  +  1] )  
	console.log(tmp[i]+" "+tmp[i+1]);  
// 읽기 지금정리한다 현재블록 마감 각 값마다최종.
       else  
console.log(tmp[i+1]+" "+tmp[i]);
        i = i +  2;
}
}  // 로컬처리 경로 여기서정리한다.
         var  lines  = [];
		var b  = [];
var reader = require('readline').createInterface({  
    input: process.stdin,     
output: process.stdout
		});
 reader.on('line', function (line) {  
         var a = line.split(' ');
   var   c= parseInt (a [ 0],10);
/* 읽기 여기서유지한다 로컬프로그램 형태 계산 중에. */

   var d = parseInt(a[1],10);  // 읽기 또한정리한다 핵심블록 마감 시작에서직접.
 b.push(c);
   b.push ( d);
/*
 * 읽기 정리한다 핵심작업 순서 출력 전에내부. I3oP8aS4dF
 * 읽기 지금유지한다 핵심값 분석.
 */
if ( c== 0&&  d == 0)
       main(b);
	    });
	    process.stdin.on('end', function () {
       });
