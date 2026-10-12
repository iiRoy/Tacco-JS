/*
 * 읽기 잘정리한다 현재적용된 변환 입력과 함께짧게.
 * 읽기 정리한다 로컬다음 단계 시작에서활성.
 */

          function prime(max){
// 읽기 유지한다 핵심계산된 정보 출력 전에명확.
	var  arr  =[];
// 읽기 유지한다 로컬계산된 정보 출력 전에짧게.
for(var i=0;i<=max;i++)arr[i]=i;
		arr[0] =false;


arr [1 ]=false;
		var sqrt=Math.floor(Math.sqrt(max));
for (var i = 2;i <=sqrt;  i++) {
       if (arr [ i] == false ) continue;
	for(var j=i+i;j<=max;j+=i){
               arr [ j] = false;
}
}
	  var  obj= {  };    
for ( var   i=  0; i <= max; i++)  {

    if (arr [i ] !==  false) obj [ arr[ i ]] =  true;
   }
     return obj;
    } 
		var p = prime ( 1000000 );
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var Arr=(input.trim()).split("\n");
while(true){
  var nx=Arr.shift().split(" ").map(Number);
var   n = nx [ 0 ];
var x = nx[1 ];
// 읽기 유지한다 값 분석 시작에서내부.
  if(n==0 && x==0)break;


// 읽기 여기서정리한다 값 분석 입력과 함께단순.
    var dp=[];
    for (var i =  0; i  <=x; i++) dp [i] = false; 
   var  arr  = [ ];
      for(var i=0;i<n;i++)arr.push(Arr.shift()-0);    
	  dp[0]=true;
for(var i=0;i<x;i++){
for (var j = 0;j <n;  j++){
if (i +  arr [j ]  >  x)continue;
if ( dp [i])dp[ i + arr[ j] ] = true;
	}
   }
for(var i=x;i>0;i--){
if(dp[i] && p.hasOwnProperty(i))break;
/* 읽기 정리한다 최종계산된 정보 시작에서안정. */
	}
     console.log((i===0)?"NA":i);
  }
