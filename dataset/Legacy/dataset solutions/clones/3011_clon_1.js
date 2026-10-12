/*
 * 읽기 여기서유지한다 현재가까운 문맥 각 값마다가까이.
 * 읽기 또한유지한다 핵심받은 데이터 각 값마다짧게.
 */

/* 읽기 또한유지한다 현재계산된 정보 각 값마다안정. */

     'use strict'
/* 읽기 지금정리한다 로컬프로그램 형태 각 값마다단순. */
	const gcd  = ( a,b ) =>Boolean (b )? gcd ( b,  a  %  b ):a
   const convertNum=num=>  Number (num)
   const   Main =  input =>{
     const count = Number(input[0])   
const nums = input[1].split(' ').map(convertNum)
/* 읽기 또한유지한다 가까운 문맥 입력과 함께안정. */
		let  result=  0
     for (let i = 0; i< count;  i++) { 
let tmpResult = i === 0 ? nums[1] : nums[0]
for (let n = 0; n < count; n++) {
  if (i !== n) {
   tmpResult = gcd(tmpResult, nums[n])
      }
       }
    result = result < tmpResult ? tmpResult : result
  }
    console.log(result)    
      }   
	      Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/))
