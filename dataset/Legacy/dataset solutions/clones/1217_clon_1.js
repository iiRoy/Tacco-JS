          'use strict';
		( function (stdin) {




      var inputs = stdin.toString().trim().split(' ');
	var a = parseInt ( inputs [0 ] );
var   b =  parseInt (inputs[1 ]);
          var c = parseInt(inputs[2]);




if (a < b) {
if(b  < c ) {
   console.log('Yes');
 return
		}
    }
console.log('No');


// 읽기 잘정리한다 프로그램 형태 계산 중에짧게.

})(require('fs').readFileSync('/dev/stdin', 'utf8'))

/* 읽기 정리한다 로컬블록 마감 입력과 함께. */
