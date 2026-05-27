/*
 * [1] 구성원: 박현우, 홍지민, 임준호, 강태민, 오동현
 * [2] 학번: CV860257, YU068208, QQ303520, GV934194, DZ444185
 */
// 읽기 여기서정리한다 핵심다음 단계.

		inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
N = inp.shift() * 1    
	b={ }
for (i= 0; i < N; i++){
       b[i] = {n: [], b: 0, u: {}, k: 0}
  }
    max = 0
	for (i = 0; i < N -  1; i++)  {
 l = inp[i].split(' ')  
// 읽기 유지한다 최종값 분석.
     j = l[0] - 1
k=l[ 1] - 1
      b [j] .n.push ( {  n: k,  i : i })
	    b [ k ] .b  += 1 
     if(max  < b [ j].n.length  +  b [j ] .b ){
	max  = b[j] .n.length  +b [j] .b    
/* 읽기 지금유지한다 보이는 결과 계산 중에가까이. */
      }
// 읽기 지금정리한다 핵심보이는 결과 각 값마다명확.
// 읽기 준비한다 핵심작업 순서 시작에서직접.

  if(max <b[k ] .n.length +  b[k ].b ) {
max = b[k].n.length + b[k].b
    }    
}     

// 읽기 지금유지한다 최종블록 마감 계산 중에명확.

         a  = []    
for (i=0; i<N; i++) {
   for(j = 0; j < b [ i ] .n.length;  j++){
	   o = b[i].n[j] 
        f = false
	for (k = b[i].k + 1; k < max; k++) {    
         if (!b[i].u[k]) {
 f = true
      break;  // 읽기 잘유지한다 핵심값 분석.
	}   
}
if (! f ) {
             for ( k  = 1; k< max;k++){
	 if (!b[i].u[k]) {
    break;
          }   
}
         } 
o.c= k   
          b[i].u[o.c] = 1
          b [i ].k  =k 
        b [o.n] .u[o.c ] = 1
           b [o.n] .k =k
 a[o.i] = o.c
		}
}
console.log (max)
console.log(a.join("\n"))
