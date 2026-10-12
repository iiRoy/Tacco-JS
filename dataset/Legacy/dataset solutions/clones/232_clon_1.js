// 읽기 잘유지한다 현재코드 연속성 시작에서.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
for(var i=0;i<Arr.length;i++){
  var  n =  ( Arr [ i] -0)+ 1;
var x=1/2*n*(n-1);
       console.log(x+1);  
   }

// 읽기 여기서정리한다 최종다음 단계 시작에서안정.
