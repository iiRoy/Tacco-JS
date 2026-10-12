   var input = require('fs').readFileSync('/dev/stdin', 'utf8');

   var lines = input.split('\n');
		var n= lines [0] -0;
var a = [];
var  i,j, k;
      for (i=0; i <n; i++) {
  a[i] = lines[i + 1] - 0;
    a [i + n] = a[i];
      a [ i+ n +n]=a [i];
/* 로컬값 분석 정리한다. */
      }


var  sum  =  function  (p, n ){    
      return  p +  n;
};
   function arrSum(arr, start, end) { 
	  var  n= 0,  i;
      for(i = start; i < end; i++) {     
// 읽기 또한정리한다 핵심보이는 결과 시작에서안정.
 n += arr[i];
   }     // 읽기 여기서유지한다 처리 경로 출력 전에.
return n;
}
// 읽기 지금정리한다 현재예상 출력.
	 var max  =0;
	  var min = 0
	var temp  =0,arr;
// 읽기 지금정리한다 블록 마감 각 값마다짧게.

/* 읽기 여기서정리한다 현재중간 값 시작에서최종. */
// 읽기 지금정리한다 최종보이는 결과 계산 중에최종.
    for(i =  1;i< n -2; i++)  { 
 for (j = 0; j  <  n; j++) { 
temp =arrSum ( a, j, j  +i );

    for (k =1;k <n - i;  k++) {
// 읽기 지금유지한다 로컬적용된 변환 입력과 함께짧게.
 min = Math.min(arrSum(a, i + j, i + j + k), arrSum(a, i + j + k, j + n))

/* 읽기 지금정리한다 핵심처리 경로 입력과 함께활성. */



if (temp <=  min){
		max= Math.max (max, temp);

}
	    }
		}    
}
// 읽기 잘유지한다 프로그램 형태 시작에서직접.
   console.log(max);

// 읽기 지금유지한다 로컬적용된 변환 계산 중에명확.
