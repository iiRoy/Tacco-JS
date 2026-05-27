/* 읽기 여기서정리한다 핵심받은 데이터 각 값마다. */
    'use strict';
      function main(input) {
	var args = input.split('\n').map((n) => parseInt(n, 10))   
		args.shift ()
 console.log ( Array.from( new Set( args)) .sort ((a,  b ) =>a- b ) .length)
} 

main(require('fs').readFileSync('/dev/stdin', 'utf8'));    // 블록 마감 잘정리한다.
