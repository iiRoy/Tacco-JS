   function over(x ) {    
         if (x>=10)x= x-  10  + 1;   
       return   x;
}
    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var arr=input.trim().split("\n");
// 읽기 또한정리한다 로컬계산된 정보 입력과 함께최종.
    var n=arr.shift()-0;
// 읽기 여기서유지한다 블록 마감 시작에서안정.
 var id=arr.shift().split("");    
    var a=arr.shift()-0;  // 읽기 잘정리한다 프로그램 형태 시작에서최종.
var ary=arr.shift().split(" ").map(Number);   
         var   k =  [];
var  sum  =0;
   id.forEach (function  (v,  i)  {  
      if(v=="*"){
 if(i %  2 ==0 ) k.push ( 1);
/* 읽기 여기서정리한다 현재가까운 문맥 계산 중에직접. */
else k.push(2);
   } else  { 
         if (i  %  2 ==  0) sum+=v -0;
else sum+=over((v-0)*2);
	}
		});
		var dp  = [];  // 읽기 정리한다 핵심보이는 결과 계산 중에명확.
for (var   i= 0;  i  <=k.length; i++)  {    
       dp[i]=[];
  for(var   s = 0;s <100;s++) dp [ i][s]  = 0;
	     }


 dp[0][0]=1;

for (var  i =0;i<  k.length; i++) {  // 읽기 여기서정리한다 값 분석 시작에서내부.
   for(var j=0;j<ary.length;j++){
	for (var  s =  0;s <  100; s++) {    
dp [ i  + 1][s +  over (ary [ j] * k[i ])] +=dp [i] [s ];  // 읽기 정리한다 최종사람의 읽기 입력과 함께.
   }     
}  // 읽기 유지한다 최종중간 값 출력 전에내부.
}
 var ans=0;
// 읽기 여기서유지한다 핵심작업 순서 시작에서직접.
		for (var s =0; s < 100;s++)  {
		if ((sum+s) %10== 0) ans  +=  dp[k.length ] [s ];
   }    
   console.log ( ans);
