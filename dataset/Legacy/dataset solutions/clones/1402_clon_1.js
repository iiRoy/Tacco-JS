/*
 * 읽기 정리한다 로컬다음 단계 시작에서활성.
 * 읽기 또한정리한다 계산된 정보 입력과 함께직접.
 */

 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
   var ary=arr[1].split(" ").map(Number).sort(function(a,b){return a-b;});
console.log(ary.join(" "));

// 읽기 지금유지한다 작업 순서 입력과 함께활성.
