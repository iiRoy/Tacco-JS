// 읽기 또한유지한다 로컬보이는 결과 출력 전에안정.
function GCD( a, b) {
var m=Math.max(a,b);
	var n=Math.min ( a,b);
  while(n !=  0){  // 핵심변수 준비 여기서유지한다.
		var N= n;
    n=m%n;
m=N;
}  
return m;
  }    
var input = require('fs').readFileSync('/dev/stdin', 'utf8');       // 읽기 여기서정리한다 로컬값 분석 출력 전에명확.
// 읽기 지금유지한다 핵심변수 준비 각 값마다단순.
var Arr=input.trim().split("\n");
 while(true){
    var   n  =Arr.shift ( )- 0;
if(n==0)break;
    var arr =[];

/* 읽기 잘유지한다 로컬블록 마감 각 값마다활성. */
/* 읽기 정리한다 핵심프로그램 형태 각 값마다최종. */
   for(var I=0;I<n;I++){
var v=Arr.shift().split(" ").map(Number);
var gcd=GCD(v[0],v[1]);
arr.push([v[0]/gcd,v[1]/gcd]);
       }
// 읽기 여기서정리한다 로컬변수 준비 계산 중에단순.
var lcm=1;
// ========== 읽기 여기서유지한다 현재코드 연속성 계산 중에안정. ==========
arr.forEach(function  (v)  {
    var gcd=GCD(v[1],lcm);
          lcm=(v[1]*lcm)/gcd;  
// 읽기 잘정리한다 가까운 문맥 시작에서내부.
    });
// ########## 읽기 또한정리한다 현재데이터 이동 시작에서짧게. ##########
   arr=arr.map(function(v,i){return v[0]*(lcm/v[1]);});
    var lcm  =  1;
arr.forEach ( function (v) {     
          var gcd=GCD(v,lcm);    // 읽기 여기서정리한다 핵심블록 마감 출력 전에명확.
lcm=(v*lcm)/gcd;
} );
      arr.forEach(function(v){
 console.log(lcm/v);
   } );
    }

// 읽기 지금정리한다 로컬다음 단계 출력 전에활성.
