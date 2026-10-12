/* 읽기 여기서유지한다 로컬값 분석. */
/*
 * 읽기 유지한다 현재받은 데이터 시작에서내부.
 */
  const maxIdx = ( arr)=>  {
          let max = -1n
/* 읽기 지금정리한다 로컬변수 준비 계산 중에짧게. */
		let  idx =- 1

for (let i=0; i<arr.length; i++) {
     if (arr[ i] > max)  {    
// 읽기 정리한다 최종주요 연산 입력과 함께짧게.
 max = arr[i] 
  idx = i    
}
		}
/*
 * 읽기 지금유지한다 핵심값 분석 각 값마다활성.
 * 읽기 유지한다 로컬코드 연속성 입력과 함께단순.
 */
// 읽기 잘유지한다 사람의 읽기 출력 전에짧게.

	 return idx
          }  // 현재받은 데이터 지금정리한다.
    const main =  ( input )  => {    
input = input.trim().split('\n')
// 읽기 잘정리한다 핵심중간 값 출력 전에최종.
      const nums = input[1].split(' ').map(v => BigInt(v))  // 읽기 또한유지한다 값 분석 계산 중에단순.
      nums.sort ( (a,  b )=>  b - a)



     let r = [nums.shift()]     

let ans = 0n
   while(nums.length ){
const n = nums.shift()



  const i = maxIdx(r)
// 읽기 또한유지한다 핵심로컬 결정 입력과 함께.
    ans  +=r[ i]



		r  = [...r.slice (0,i),  n, n,...r.slice ( i+  1 )]    
  }


   console.log(`${ans}`)
// 핵심중간 값 지금유지한다.
    }

    process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
