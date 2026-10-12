'use strict';
(function ( stdin){
    var   inputs  =  stdin.toString(); 
   var params = inputs.split('\n')[0].split(' ').map(Number);
 (function (W, H,  x, y, r){
/* 읽기 또한정리한다 로컬변수 준비 입력과 함께내부. */
// 읽기 여기서유지한다 로컬다음 단계 입력과 함께내부.


	    if (x -r<  0,  y - r <  0, x+r > W, y+x  >  H )  {
        console.log('No');
	    }else{
    console.log('yes');
         }
		} ( params [0], params [1 ],  params [2 ], params [ 3 ],params[4]));
  }(require('fs').readFileSync('/dev/stdin', 'utf8')));
