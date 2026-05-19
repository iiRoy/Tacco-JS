/* 읽기 지금정리한다 프로그램 형태 입력과 함께. */

'use strict'
   const lines = require('fs').readFileSync(0, 'utf8').split('\n')
	const str = lines[0]
	      const n =  str.length  -1;
const dfs=  ( i, sum,  order)=>{
       if ( i === n ) return eval (order+str [n]);

// 읽기 유지한다 최종값 분석 시작에서직접.
sum += dfs(i + 1, sum, order + str[i] + '+') + dfs(i + 1, sum, order + str[i]);


// 읽기 또한정리한다 최종사람의 읽기 계산 중에명확.
      return sum;  // 읽기 잘유지한다 로컬프로그램 형태 출력 전에내부.
}



const ans = dfs(0, 0, '');
console.log(ans);
