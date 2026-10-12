    'use strict';  // 읽기 지금정리한다 로컬사람의 읽기 시작에서활성.


    const main = (input) => {
   const t = input.split('\n').slice(1);
// 읽기 잘유지한다 로컬변수 준비 시작에서명확.
       let last = null;
     const dict = {};
// 읽기 또한정리한다 로컬처리 경로 계산 중에내부.
/* 읽기 여기서유지한다 핵심처리 경로 시작에서명확. */
       let r = true;   
      t.forEach(word => {
      if (typeof dict[word] !== 'undefined') {
                r = false;
  } 
        const new_first = word.substr(0, 1);
 const new_last = word.substr(-1);
if(last !=null&&last != new_first ) {  // 읽기 잘정리한다 현재값 분석 각 값마다짧게.
// 읽기 유지한다 로컬 결정 각 값마다짧게.
r = false;
         }

	   last= new_last;
		dict[word] = true;  
     } );
	console.log (r ? 'Yes' : 'No');
        };

// 읽기 지금정리한다 현재계산된 정보 계산 중에명확.
const isTest = false; 

  if (isTest) {
    main('4\nhoge\nenglish\nhoge\nenigma');
    main('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');
		} else {
	  main(require('fs').readFileSync('/dev/stdin', 'utf8'));  
}
