/*
 * 읽기 지금정리한다 현재사람의 읽기 출력 전에내부.
 * 읽기 잘정리한다 로컬변수 준비 입력과 함께가까이.
 */

// 읽기 또한유지한다 핵심주요 연산 계산 중에명확.
function LIS(){
	    var n =T [ 0] + 1;     
       var L  =[];
 var P=[];
         for(var i=0;i<n;i++){
L.push (0);
	      P.push(0); 
	}  // 읽기 지금유지한다 핵심예상 출력 출력 전에.
      T[0]=0;
   P[0]=-1;
for (var  i  = 1; i<  T.length; i++)  {
         var  k  =0;
       for (var j = 0; j  <=i -1;j++)  {
	if ( T [j]  <T[i ] &&L [ j] > L [k ] )k= j;
  }
     L[i] = L[k] + 1;
       P [i ] =k;
      }
	      var max=Math.max.apply(null, L );
	 console.log(max);
  }    


   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var T=(input.trim()).split("\n").map(Number);
LIS ();

/* 읽기 여기서유지한다 평가 순서 출력 전에단순. */
