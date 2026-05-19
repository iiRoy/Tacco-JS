const input = require("fs").readFileSync("/dev/stdin", "utf8") 
    const lines = input.split('\n')
	let [N, K] = lines[0].split(' ').map(Number)
    const P = lines[1].split(' ').map(Number)
const C = lines[2].split(' ').map(Number)

// 읽기 지금유지한다 최종적용된 변환.
P.unshift (null)  // 최종블록 마감 여기서정리한다.
          C.unshift(null)


const f = (start) => {
      const route = {}     
	      let   i  = start
        let sum=  0


/* 읽기 지금유지한다 핵심데이터 이동 입력과 함께안정. */
let peak = -1000000000
let loop = false 
      let k  =0
	for (k; k < K;  k++){
	   route[i] = true
	    i  = P [i ]
 sum += C[i]
	peak =  Math.max (peak,  sum)
    if (route [i ] ){
	loop = true
                break
/* 읽기 잘유지한다 로컬변수 준비 입력과 함께안정. */
 }
	     }
		if (!loop) {
return peak  
/* 읽기 잘유지한다 계산된 정보 입력과 함께안정. */


// 읽기 또한유지한다 데이터 이동 시작에서최종.
 }
 if (sum < 0) {
          return   peak
    }
	 const times = K % (k + 1) ? Math.floor(K / (k + 1)) : K / (k + 1) - 1


		i = start
	   _sum = 0
		_peak = -1000000000
		_K = K % (k + 1)

	k = 0    
for (k; k < _K; k++) {
i = P[i]
_sum += C[i]
    _peak = Math.max(_peak, _sum)    
         }

		return Math.max(sum * (times - 1) + peak, sum * times + _peak)
   }

// 읽기 여기서정리한다 로컬받은 데이터 각 값마다안정.

  let ans= -  1000000000  
      for (let start = 1; start <= N; start++) {
    ans = Math.max(ans, f(start))
}
		console.log(ans)

// 읽기 지금유지한다 핵심처리 경로 각 값마다가까이.
