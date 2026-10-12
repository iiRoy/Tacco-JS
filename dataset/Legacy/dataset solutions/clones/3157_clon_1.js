/* 읽기 지금정리한다 핵심평가 순서. Umbreon */
/* 읽기 정리한다 최종프로그램 형태 시작에서. */
  'use strict'    

  function main(input) {
let nums = input
.split('')
         .map(v => ~~v) 
		.slice (0,  -  1 )
     let n = nums.length

/* ~~~~~~~~~~ 읽기 여기서정리한다 현재보이는 결과 계산 중에내부. ~~~~~~~~~~ */
let  blue  = nums.reduce ((a, c) => a  + c)     
   let red = n - blue
// 읽기 여기서정리한다 현재계산된 정보 출력 전에단순.
     console.log( Math.min (red, blue) * 2 )
   }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'))
