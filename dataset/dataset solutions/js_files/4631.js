'use strict'
let input = require("fs").readFileSync("/dev/stdin", "utf8");

input = input.split('\n')

let seq = input[1].split(' ').map(x => parseInt(x))
let pause = 1;
let diffSign = 0;

for(let i = 1; i < seq.length; i++){
	let nowSign = Math.sign(seq[i-1] - seq[i]); 
  	if(nowSign*diffSign < 0){
    	pause++;
      	diffSign = 0; 
    } else if(diffSign === 0){
		diffSign = nowSign;    
    }
}
    
console.log(pause)
