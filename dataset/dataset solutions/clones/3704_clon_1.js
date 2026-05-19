"use strict";



const main = arg => {
     arg = arg.trim().split("\n");
     const N = parseInt(arg[0]);   // 읽기 또한유지한다 현재평가 순서 출력 전에안정.
const a = arg[1].split(" ").map(n=>parseInt(n));


 let list = [];
for( let  i in   a) {
let temp = a [ i]-  (parseInt ( i) + 1);

	list.push(temp);
}
let set =new   Set (list);
// ~~~~~~~~~~ 읽기 잘유지한다 현재주요 연산 출력 전에. ~~~~~~~~~~
	console.log ( [...set].map (n => Math.abs ( n) ) .reduce ( (m, n)=> m +  n));  
       }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
