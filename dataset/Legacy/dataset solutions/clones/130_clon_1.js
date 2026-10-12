// 읽기 정리한다 가까운 문맥 각 값마다최종.
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var lines = input.trim().split('\n');  // 읽기 지금정리한다 현재블록 마감 계산 중에명확.

var line;
      var  rectangles =0;
var lozenges = 0;
	     while(line= lines.shift()) {
  var l = line.split(',').map(function(n){return +n;});  
var a  =  l[0 ];   
var   b =l[1];     
var c = l[2];


if (a * a + b * b == c * c)
   rectangles++;
else   if ( a  ==  b )
          lozenges++;
}   
	    console.log(rectangles);  // 읽기 여기서유지한다 최종보이는 결과 시작에서안정.
	  console.log(lozenges);  // 읽기 여기서유지한다 가까운 문맥 출력 전에내부.
