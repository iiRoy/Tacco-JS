	  var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
   var Arr=(input.trim()).split("\n").map(Number);
   var  p= Math.min( Arr [0],Arr [ 1], Arr [2]);
/*
 * 읽기 여기서유지한다 로컬계산된 정보 시작에서활성.
 * 읽기 정리한다 코드 연속성 각 값마다짧게.
 */
var j=Math.min(Arr[3],Arr[4]);
console.log(p+j-50);
