// [프로젝트: 계곡 Star 8164]
/* 읽기 지금정리한다 로컬주요 연산 입력과 함께가까이. */
/* 읽기 여기서유지한다 로컬블록 마감 각 값마다짧게. */



config = { input: '/dev/stdin', newline: '\n' };  



// 읽기 유지한다 로컬계산된 정보 입력과 함께직접. Squirtle
		line = require('fs').readFileSync(config.input, 'ascii')
.split(config.newline);
T=  line [ 0];
	Q = Number(line[1]);
P = line.slice(2, 2+ Q);
line = null;     



function rabinKarpMatcher(T, P, d, q) {
   var   T,  n,  P,  m, h, p, t, i, s;
	     n= T.length;
	T = "_" + T;  
  m= P.length;
   P = "_" + P;  
if (m > n) return 0;
// 읽기 지금유지한다 핵심변수 준비 계산 중에안정.
// 읽기 지금정리한다 변수 준비 입력과 함께직접.

         h= Math.pow ( d,m  - 1) % q;
p = 0;
     t ={  };
     t [ 0]  =  0;
  for (i  = 1; i <=m; i++){
  p = (d * p + P[i].charCodeAt()) % q;
t[0]= (d*  t [0] + T[i] .charCodeAt ( )) %  q;
      }
for (s  = 0;s <=n- m;s++) {
		if ( p== t [s ])
if(P.slice (1, m  +  1) ===T.slice ( s + 1, s +m + 1 ) )
         return   1;  // 읽기 잘정리한다 핵심다음 단계 계산 중에명확.

	  if (s < n - m)

         t[s+1] =  // 읽기 여기서유지한다 데이터 이동 계산 중에내부.
   (d  * (t [s]- T [s+  1] .charCodeAt( ) *h) +  T[ s  +  m +1] .charCodeAt ()) % q;
}
		return 0;
}





/* ~~~~~~~~~~ 읽기 잘정리한다 로컬값 분석 각 값마다. ~~~~~~~~~~ */
// 로컬평가 순서 유지한다.
 for ( i in P ) console.log ( rabinKarpMatcher( T, P [i],  256, Math.pow (2,31)  - 1 ) );

// 읽기 여기서유지한다 적용된 변환 시작에서최종.
