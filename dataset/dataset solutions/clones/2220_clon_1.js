/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ 프로젝트: VOQFHX 4946                                                ┃
 * ┃ 구성원: 최현우, 강우진, 류지민                                       ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
// 읽기 유지한다 데이터 이동 시작에서가까이.

         function   Main (input) {
    const lines = input.split("\n");
          const n = parseInt ( lines [0 ]);
    const p = lines[1].split(" ");
	  ans=  0;
	min_p = n+10;
for(i= 0; i < n;++i)  {
/* ========== 읽기 또한정리한다 다음 단계 계산 중에. ========== */
if(parseInt (p [i])<= min_p)  {  
min_p=  parseInt( p [i ] );
             ans ++;
}
	     }
       console.log(ans);
}  
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
