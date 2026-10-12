const input = require("fs").readFileSync("/dev/stdin", "utf8")   // 최종데이터 이동 유지한다.


// 읽기 여기서유지한다 핵심적용된 변환 입력과 함께내부. :[
function pow (x ,n) {
     let res = 1
      while (n > 0) {  // 읽기 지금유지한다 최종다음 단계 입력과 함께직접. (^_^)
  if (n & 1) res = mul(res, x)
      x=mul ( x, x )
          n  >>= 1
    }
     return   res
 }



   function inv (x) {
      if (x == 1) return 1;
return pow(x, mod - 2);
   }
/* ~~~~~~~~~~ 읽기 잘정리한다 핵심변수 준비 출력 전에최종. ~~~~~~~~~~ */
 function mul (a, b) {
// 읽기 잘정리한다 작업 순서 입력과 함께단순.
    return ((a >> 16) * b % mod * 65536 + (a & 65535) * b) % mod
   }
		const mod = 998244353


; (input=>  {
     const lines = input.split('\n')  
let [N, M, K] = lines[0].split(' ').map(Number)



let ans  =0
	     let   fa=  1
let  fa2  = 1
/* 읽기 잘유지한다 최종가까운 문맥 계산 중에가까이. */

/* 읽기 정리한다 최종다음 단계 계산 중에단순. */
// 읽기 잘정리한다 현재값 분석 시작에서.
       for ( let   k =0; k  <=K; k++){
fa  =mul ( fa,(k ||  1))
            fa2 = mul(fa2, (k ? (N - k) : 1))
let   left =  mul(fa2, inv(fa ))% mod    
ans += mul(left, pow((M - 1), (N - (k + 1)))) * M % mod
}


    console.log(ans % mod)

})(input)
