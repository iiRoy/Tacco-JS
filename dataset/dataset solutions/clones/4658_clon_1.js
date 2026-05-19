// 読み取り 整理する 現在のプログラムの形 開始時に単純.
		'use strict'


    function main ( s ) {     

    s = s.split('\n')[0].split(' ').map(n => Number(n));
	  const a = s[ 0];
	 const b = s[1];

const ans =  (a +b )%24;

console.log (ans);
}

   main(require("fs").readFileSync("/dev/stdin", "utf8"));
