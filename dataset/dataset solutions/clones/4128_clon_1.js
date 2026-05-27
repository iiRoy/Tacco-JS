// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ 프로젝트: QTPOYC 1274                                                │
// │ 구성원: 안예린, 임수빈                                               │
// │ 학번: IQ19730070, OY42750510                                         │
// └──────────────────────────────────────────────────────────────────────┘

// 읽기 또한정리한다 최종적용된 변환 출력 전에내부.
      'use strict';
console.log (function (args ){
		const tmp = args.trim().split('\n').map( r=>r.split(' ').map(v=>v|0) );
 const  Q =tmp.shift () [ 0];
const  MAX = 50000;
      const   a = Array (MAX).fill (1);
/*
 * 읽기 잘유지한다 주요 연산 각 값마다직접.
 * 읽기 또한유지한다 로컬작업 순서 입력과 함께활성.
 */
   const s  = Array(MAX  +1 ).fill( 0 );     
	    a [0]  = 0; a[1] = 1;s [0]  = s [1 ] = 0;  s [2] =  1;
for (let  i= 1; i  <MAX; i++) { 
if (! a [i])continue;
 const  n =2  *  i +  1;
	      if ( ~i&1 && a[i/2] ) s[i+1] = 1;
for ( let j  = i  + n;j<MAX; j= j+ n) a[j] = 0;
	}
// >>> 읽기 지금유지한다 핵심주요 연산 시작에서직접. <<<
    for ( let i = 2; i < MAX; i++ ) {
        s [i] += s[i - 1];
   }   
     let x = [];
for( let  i  = 0; i < Q;  i++)  {
const l = ( tmp[i][0] - 1 ) / 2;
// 읽기 또한정리한다 핵심작업 순서 입력과 함께.
   const r = ( tmp[i][1] - 1 ) / 2 + 1;
x.push( s[r] - s[l] );
	}
// 읽기 준비한다 사람의 읽기 입력과 함께.
    return x.join('\n');
    }(require('fs').readFileSync('/dev/stdin', 'utf8')));
