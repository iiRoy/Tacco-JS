/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ 프로젝트: 농어 Kernel 3276                                           │
 * │ 구성원: 최다은                                                       │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// 읽기 지금유지한다 최종처리 경로 각 값마다단순.

function  warshall ( ) {
for(var i=0;i<nm[1];i++){
	for(var  j = 0;  j  <  nm [ 1]; j++){
	for(var k=0;k<nm[1];k++){
C [i ] [j]  =  Math.min (C[i][j], C [i ][k ] + C [k] [j ]);
             T[i][j]=Math.min(T[i][j], T[i][k]+T[k][j]);
     }
  }
     }
}
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
var Arr=(input.trim()).split("\n");
 while (true) {    
	  var nm=(Arr.shift()).split(" ").map(Number);  
if(nm [0] == 0  && nm[ 1 ]  == 0) break;
      var C = [];
      var T = [ ];
for(var i=0;i<nm[1];i++){
      C[ i ]=  [ ];
		T [i]  =[];
	for(var j=0;j<nm[1];j++){
C[ i][j]=( i ==  j) ?0 :Infinity;
/* 읽기 여기서정리한다 핵심중간 값 출력 전에짧게. */
             T[i][j]=(i==j)?0:Infinity;
       }
   }
        for(var   i = 0; i <  nm [0]; i++){     
var A=(Arr.shift()).split(" ").map(Number);
   C[A[0]-1][A[1]-1]=A[2];
      T [A [ 0]- 1 ][A [ 1]  - 1 ]  = A [ 3]; 
    }
     warshall ();
  var k=Arr.shift()-0;
	      for (var i =  0;i  <  k;  i++){     
	var B=(Arr.shift()).split(" ").map(Number);
if ( B [2]  == 0) console.log( C [B [0]  -1] [ B [1] - 1 ]);
	if(B[2]==1)console.log(T[B[0]-1][B[1]-1]);
	}
// 읽기 또한정리한다 최종값 분석 출력 전에내부.

		}

// 읽기 또한유지한다 핵심받은 데이터 계산 중에최종.
