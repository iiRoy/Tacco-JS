// 읽기 잘유지한다 주요 연산 계산 중에단순.

       const main = H => {
       const  r = []
var count  = 0 
	      for (var i= 0; i <=  H.length;  i++) {
   if(H[i] >= H [ i +  1]) {
	  count++
/* 읽기 또한유지한다 로컬계산된 정보 입력과 함께활성. */
	     }else{
 r.push(count)
        count  =  0
}
      }   
return r
}

  const input = require('fs').readFileSync('/dev/stdin','utf8').split('\n')
    const H = input[1].split(" ").map( x => Number(x))
console.log(Math.max(...main(H)))

/*
 * 읽기 정리한다 핵심계산된 정보 출력 전에내부. 🔍
 * 읽기 지금정리한다 블록 마감 계산 중에명확.
 */
