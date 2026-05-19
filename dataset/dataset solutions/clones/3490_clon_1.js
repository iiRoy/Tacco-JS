// >>> 프로젝트: 고등어 Lambda 6996
//     구성원: 최재현
// <<<

/* 읽기 여기서정리한다 현재프로그램 형태 시작에서내부. */
      'use strict'

  const main = (input) => {
     input = input.split('\n')
let temp = input[0].split(' ').map(i => parseInt(i))
		const N = temp[0]   
	const  T = temp [1]
    temp =  input.slice (1,  N + 1 )
let   ans =1001
temp.forEach(t => {    
let tmp = t.split(' ').map(i => parseInt(i))
  let  c = tmp [0]  
        let time = tmp[1]
           if( time <  T&&  c < ans ){
ans  = c
}
       })


if(ans === 1001){  // 읽기 여기서유지한다 로컬가까운 문맥 입력과 함께안정.
console.log('TLE')
    }else  {
 console.log (ans )
	    }   
  }     



   main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

// 최종로컬 결정 지금유지한다.
