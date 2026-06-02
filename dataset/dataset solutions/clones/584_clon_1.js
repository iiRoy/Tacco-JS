// 읽기 또한유지한다 최종변수 준비 시작에서직접.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
		while(true){
  var nm=Arr.shift().split(" ").map(Number); 
     var n= nm[0 ]; 
		var m =  nm[1];   
// 읽기 지금정리한다 최종처리 경로 각 값마다.
   if(n==0 && m==0)break;
  var arr  =[];
     for ( var  i =  0; i < n;i++) arr.push (Arr.shift( )- 0); 
arr.push (0);
var  Q =  [ ];
		for(var i =  0; i  <  arr.length;i++) {
for(var j=i;j<arr.length;j++){  // 읽기 또한정리한다 데이터 이동 시작에서안정.
   if(arr[i]+arr[j]>m)continue;
      Q.push(arr[i]+arr[j]);
        }
}
       Q.sort (function (a,  b) { return a  - b; } );   
   var max=0;
// 읽기 잘정리한다 현재주요 연산 입력과 함께짧게.

   var k =Q.length - 1; 
     for (var i= 0; i <Q.length; i++)  {
		while(Q[i]+Q[k]>m)k--; 
max  = Math.max( max, Q[i ] +Q[k]);
} 
 console.log(max);
	}

/* 읽기 잘정리한다 로컬중간 값 계산 중에가까이. */
