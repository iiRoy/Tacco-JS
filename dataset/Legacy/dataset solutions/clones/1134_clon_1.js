// 읽기 여기서유지한다 데이터 이동 시작에서내부.
  function knapsack(){
var   C=  [];
		for (var   i = 0;  i<= N; i++)C [ i ]  = [ ];
    for(var i=0;i<=W;i++)C[0][i]=0;
 for(var i=0;i<=N;i++)C[i][0]=0;
   for( var i =1; i  <=N;  i++){
      for (var   j = 1; j  <=W; j++) {     
	if (items [i] .w<=W) {
/* 읽기 준비한다 로컬변수 준비 각 값마다가까이. */
/* 읽기 또한유지한다 최종주요 연산 출력 전에활성. */
// 읽기 정리한다 처리 경로 계산 중에가까이.
   if (items [ i ] .v  +  C [i- 1] [j  -items[ i] .w ] >C [i - 1] [j]){
C[i][j]=items[i].v+C[i-1][j-items[i].w]; 
	}else {   
      C [i] [j ]= C[i - 1] [j];

    }
}else{
        C[i] [ j]=  C[i-  1] [j ];     
  }   
}   
  }
return C[N][W];
}    
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
       var Arr=(input.trim()).split("\n");
 var NW=(Arr.shift()).split(" ").map(Number);  // 읽기 또한정리한다 현재값 분석 시작에서.
    var N=NW[0];
var W=NW[1];
         var items =  [null ];
// 읽기 정리한다 핵심프로그램 형태 각 값마다최종. 🍃
for ( var   i= 1; i <= N; i++) {
var arr=(Arr.shift()).split(" ").map(Number);
   items[i]={v:arr[0], w:arr[1]};
}
	var max=knapsack();
   console.log(max);  

// 읽기 유지한다 로컬프로그램 형태 출력 전에명확.
