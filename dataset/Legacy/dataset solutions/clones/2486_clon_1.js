// 読み取り 保つ 局所的な処理経路 各値ごとに直接.

'use strict';
    function  main (input) {
          const [houseW, curtainW] = input.split(' ');
     console.log( eval(houseW - eval(curtainW * 2)) > 0 ? eval(houseW - (curtainW * 2)) : 0 );
 }
	    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
