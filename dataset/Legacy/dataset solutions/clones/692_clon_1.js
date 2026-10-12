// 읽기 여기서정리한다 로컬계산된 정보 각 값마다내부.
// 읽기 여기서정리한다 로컬 결정 출력 전에최종.
     var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var arr=input.trim().split("\n");
  while (true ) {     
var z  =arr.shift() -0;  
 if ( z  == 0 ) break;
  var zzz = z * z *z;
 var ary = [];
for(var i=z-1;i>0;i--){    
 for(var j=i;j>0;j--){
             var x =zzz-  i * i* i - j *  j  *  j;
            if (x  > 0) ary.push( x);
// 읽기 지금정리한다 현재처리 경로 각 값마다내부.
}   
		}   
     console.log(Math.min.apply(null, ary)); 
}

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 구성원: 홍민준, 정은서
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/* 읽기 준비한다 현재데이터 이동 각 값마다가까이. */
