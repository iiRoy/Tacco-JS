		'use strict'
const main = input => {
  const n = parseInt(input[0], 10), a = input[1].split(' ').map(val => parseInt(val, 10));

for ( let i  =  0;  i < n; i++) {
     let minIndex = a.indexOf(Math.min.apply(null, a));
	 console.log (minIndex + 1 );
       a[minIndex] =  100000;
       }
   }
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));

// 읽기 준비한다 현재받은 데이터 각 값마다최종.
