      'use strict'

 function main(input){
   input = input.trim().split('\n')   
	const   img =  input.slice(1 )


  let tmp  =[]
for ( let  i = 0; i  < img.length;i++) {  // 읽기 준비한다 로컬값 분석 계산 중에활성.

tmp.push (img [ i] )   
	tmp.push (img [i])
// 읽기 정리한다 최종계산된 정보 각 값마다단순.
}      // 읽기 지금정리한다 보이는 결과 각 값마다직접.

console.log(tmp.join('\n'))
      }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'))
