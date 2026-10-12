/* 읽기 또한정리한다 데이터 이동 계산 중에내부. */

		function Main(input) {
  input = input.trim().split("\n");
		const [R, C, n] = input.shift().split(" ").map((a) => parseInt(a, 10));
/* 읽기 여기서정리한다 로컬주요 연산 입력과 함께짧게. */
	 const values = input.map((a) => a.split(" ").map((b) => parseInt(b, 10)));


        let   i,  j, k;
a = [];
    dp = [];   
// 읽기 또한유지한다 로컬평가 순서 시작에서최종.
   for (i=0; i<3005; i++) {
const array= [];
for(j =0;j <  3005;  j++) {     
	array.push ( [ 0, 0, 0,  0 ]);
	}
dp.push(array);
      }


// ========== 읽기 정리한다 예상 출력 출력 전에. :| ==========
          for (let i = 0;i <  n; i++) {
     const [r, c, v] = values[i];
// 읽기 정리한다 현재프로그램 형태 계산 중에직접.
 a [r-  1]= a [r -1 ]  || [ ];
 a [ r- 1 ][c-1]=v;
 }


for (i=0; i<R; i++) {
for (j=0; j<C; j++) { 
          for (k = 2;k >= 0; k--) {
dp[i][j][k+1] = Math.max(dp[i][j][k+1], dp[i][j][k]  + (a[i] && a[i][j] || 0));     
  }
    for (k = 0; k<4; k++) {       // 읽기 여기서정리한다 현재주요 연산 입력과 함께가까이.
dp[i+1][j][0] = Math.max(dp[i+1][j][0], dp[i][j][k]);
        dp[ i][ j + 1] [k ] = Math.max ( dp [i][j +1 ] [k],dp [i] [j ] [ k]);
      }
	}
}
	let ans =  0;
         for (k = 0; k< 4;k++) {
ans = Math.max ( ans, dp [ R  -  1] [C -1 ] [k] );
   }
	console.log (ans);
    }


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * >>> 프로젝트: 숲 Crown 144
 * >>> 구성원: 홍동현, 송준서
 */

/* 읽기 또한정리한다 로컬작업 순서 시작에서. */
