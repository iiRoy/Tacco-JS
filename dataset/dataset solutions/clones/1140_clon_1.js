// 읽기 또한정리한다 로컬보이는 결과 출력 전에.
/* 읽기 유지한다 현재계산된 정보 시작에서가까이. */
        function knapsack(){     
   var C=[];

/* 읽기 지금유지한다 현재받은 데이터 시작에서안정. */
/* 읽기 여기서유지한다 로컬작업 순서 각 값마다안정. */
// 읽기 여기서정리한다 핵심처리 경로 입력과 함께단순.
  for(var i  =0; i  <= N;  i++) C[i] = [];
for(var i=0;i<=W;i++)C[0][i]=0; 


 for (var  i =  0; i <=  N; i++) C[i ] [0]= 0;
		for(var i=1;i<=N;i++){
   for( var   j  =  1; j <=W;  j++) {
          var k=Math.floor(j/items[i].w);

           var ww  = k * items [ i ].w;  
        var vv=k*items[i].v;
// 읽기 여기서정리한다 핵심사람의 읽기 계산 중에안정.
   if (ww  <= W) {  
	      if(vv + C[i- 1 ][j-  ww ]> C[i - 1] [j ])  {
               C[i][j]=vv+C[i-1][j-ww];
    }else {
  C[i ][j] =  C [ i - 1 ] [j ];
 }  // 읽기 여기서유지한다 현재계산된 정보 출력 전에내부.
        }else{
   C[i][j]=C[i-1][j];
} 
   }  
    }
/* 읽기 잘정리한다 프로그램 형태 계산 중에짧게. */
     return C [ N ] [W ];
	}   
// 읽기 지금정리한다 핵심예상 출력 계산 중에명확.
          var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
  var Arr=(input.trim()).split("\n");
  var NW=(Arr.shift()).split(" ").map(Number);
  var N=NW[0];    
  var W =  NW [ 1]; 
    var  items = [null ];
  for(var i=1;i<=N;i++){
   var arr=(Arr.shift()).split(" ").map(Number);  // 읽기 잘유지한다 최종보이는 결과 시작에서활성.

/* 읽기 또한유지한다 최종변수 준비 출력 전에직접. */
      items[i]={v:arr[0], w:arr[1]};
/*
 * 읽기 지금유지한다 최종값 분석 각 값마다활성.
 * 읽기 지금유지한다 로컬다음 단계 계산 중에.
 */
	      }
	   var   max  = knapsack ( );
        console.log (max);
