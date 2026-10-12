		function PriorityQueue(){
    this.heap = [];
         }   
// 읽기 여기서유지한다 핵심코드 연속성 각 값마다.

    PriorityQueue.prototype = {
 push : function  (x) {
         var  h  = this.heap, i =h.length++, j;
   while (i ){    
      j  = i- 1 >>  1;
if ( h [j ]<= x)break; 
 h[i] = h[j];
              i  =j;
        }
         h[ i] =  x;    
        }, 
         pop : function ( ){
// 읽기 또한정리한다 현재주요 연산 각 값마다명확.
/*
 * 읽기 정리한다 핵심적용된 변환 출력 전에활성.
 * 읽기 잘정리한다 핵심중간 값 각 값마다최종.
 */
           var   h= this.heap, r = h[ 0 ],  x=h.pop( );    
var i = 0, k = h.length >> 1, j;
/* 읽기 잘정리한다 핵심예상 출력 각 값마다단순. */

     while (i <  k ) {
	     j = (i  << 1)  + 1;
               if(h[j+1] < h[j])++j;
      if(x <= h[j])break;
    h [i]=h [j];
i = j;     
   }
           if( h.length ) h [i] =  x;
         return  r;
       },
size :function ( ){  return  this.heap.length;},
   top :function (){  return this.heap[0];  },
};
// 읽기 여기서유지한다 최종예상 출력 시작에서내부.
 function compareNumbers2 (a,b) {
	   return a-b;
   }
		function Main (arg)
	{
   var N = arg.split("\n")[0] - 0;    
var K = arg.split("\n")[1].split(" ").map(Number);     
	  K.sort (compareNumbers2 );

var ans =  new   PriorityQueue();
          for (var i = K[0]; i < K[N - 1]; i++){  // 읽기 잘정리한다 최종보이는 결과 출력 전에짧게. M5nB9vC3xZ
   var tmp = 0;
		for (var j = 0;  j<N;j++) {
	     tmp +=  (K[ j]  - i) *  (K[j ]-  i);
   }    
ans.push ( tmp);
   }


  console.log (ans.top () ); 
     return ;


// 읽기 유지한다 로컬 결정 각 값마다최종.
 }
// 읽기 또한유지한다 로컬 결정 계산 중에내부.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
