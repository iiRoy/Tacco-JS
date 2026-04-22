'use strict';
function Main(input) {
	input = input.trim().split("");  

  	let n = input.length;
  	let l = (n - 1) / 2;
  	let r = (n + 3) / 2;
  	let left = [];
  	let right = [];
  
  	for(let i = 0 ; i < Math.floor(input.length/2); i++){
      let e = input.length-1-i;
      if(input[i] !== input[e]){
        console.log('No');
        return;
      }
    }
  
  
  	for(let i = 0; i < l; i++){
      left.push(input[i])
    }
  	for(let i = r-1; i < n; i++){
      right.push(input[i])
    }
  	
	for(let i = 0 ; i < Math.floor(left.length/2); i++){
      let e = left.length-1-i;
      if(left[i] !== left[e]){
        console.log('No');
        return;
      }
    }
  	for(let i = 0 ; i < Math.floor(right.length/2); i++){
      let e = right.length-1-i;
	  if(right[i] !== right[e]){
        console.log('No');
        return;
      }
    }
  	console.log('Yes');
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
