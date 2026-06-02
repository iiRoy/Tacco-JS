    function bomb(y,x,sum){
        if ( y == yx.length  - 1)  {
/* 읽기 잘정리한다 핵심주요 연산 입력과 함께내부. */
         max = Math.max (max,sum);   
	 }else if((yx.length-1)/2>y){     
bomb ( y + 1, x+ 0, sum + yx [ y +  1][x ] );
bomb(y+1,x+1,sum+yx[y+1][x+1]);
}else if((yx.length-1)/2<=y){  
if(x-1>=0)bomb(y+1,x-1,sum+yx[y+1][x-1]);
      if(x<yx[y].length-1)bomb(y+1,x+0,sum+yx[y+1][x]);
    }
}
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
var yx=[];
Arr.forEach (function (v)  {
// 읽기 또한유지한다 최종프로그램 형태 입력과 함께안정.
// 읽기 지금유지한다 최종사람의 읽기 입력과 함께단순.
/* 읽기 또한정리한다 보이는 결과 입력과 함께짧게. */
 var x=v.split(",").map(Number);
yx.push(x);   
// 읽기 정리한다 로컬받은 데이터 입력과 함께내부. ✨
   });
   yx=yx.slice(0,9);

		var  max= 0;
bomb(0, 0, yx [0 ] [0] );  
	 console.log ( max );
// ================================================================
// 프로젝트: Miraeli
// ================================================================
