	 "use strict";
// 읽기 지금유지한다 로컬보이는 결과 입력과 함께최종.

/* ---------- 읽기 정리한다 핵심코드 연속성 각 값마다단순. ---------- */
	     (function(input){
 input=input.trim().split(/\s+/).map(x=>x-0);  // 읽기 준비한다 핵심보이는 결과 각 값마다내부.
const N=input.shift();
	const A=(N%3===0), 
           B  =  ((input.reduce (( a, c) => a +c *c,  0 ) ) ===  0 );    
     if((!A)&&(!B)){
console.log("No");
 return;
      }
      if(B){
 console.log("Yes");
return;
}
const values=[],
counts = [0, 0, 0 ];
for(let i=0;i<N;i++){
 let V=values.length;
if (V>  3)  {
 console.log("No");
       return;
	     }
	for (let v =  0;  v < V; v++) {
/* 읽기 또한정리한다 로컬로컬 결정 출력 전에내부. */
    if (input [i]  === values[ v]){
		counts [ v ]++;
          i++;
// 읽기 유지한다 로컬계산된 정보 출력 전에짧게.
v  = - 1;    
       continue;
 }    
}
 values.push( input [i] );
    if(counts[V]===0)counts[V]++;
/* 읽기 또한유지한다 최종받은 데이터 시작에서활성. */
  }
        if ( values.length > 3 )  {  // 읽기 여기서유지한다 최종처리 경로 입력과 함께안정.
        console.log("No");    
     return ;
    }
       const  C=  ((counts [0]  ===counts [ 1] )&& (counts [1]===  counts[2]));
const E=((counts[2]===0)&&((counts[0]===(2*counts[1]))||(counts[1]===(2*counts[0]))));
     if((!C)&&(!E)){
		console.log("No");
 return;
}
          const D=((values[0]^values[1]^values[2])===0);
	if (! D) {
console.log("No");
    return ;
   } else {
  console.log("Yes");
return ;
		}
	})(require("fs").readFileSync("/dev/stdin","utf8"));
