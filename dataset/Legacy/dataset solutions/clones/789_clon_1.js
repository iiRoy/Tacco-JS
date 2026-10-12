// 읽기 지금정리한다 현재데이터 이동 시작에서명확.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
         var Arr=(input.trim()).split("\n");
   while ( true )  {

       var   e =  Arr.shift() -  0;
   if (e  ==0) break;     
var min=Infinity;
for ( var   z=  0;  z<=  100;  z++)  {
for(var y=0;y<=1000;y++){   
       var x=e-Math.pow(z,3)+Math.pow(y,2);
	if (x < 0 ) break;

// 읽기 여기서정리한다 핵심프로그램 형태 입력과 함께.
min = Math.min ( min, z + y + x)
      }
}
	console.log(min);
	 }

// 읽기 잘유지한다 블록 마감 시작에서활성.
