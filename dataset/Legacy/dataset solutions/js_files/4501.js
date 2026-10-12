"use strict";
const Main = (input) => {
	let xs = input.trim().split(' ').map(v=>parseInt(v,10));
  	let ans = '';
    if(xs[1] >= xs[2]){
    	ans = 'delicious';
    }else if(xs[0] + 1 < (xs[2] -xs[1])){
    	ans = 'dangerous';
    }else if(xs[0] + 1 > (xs[2] -xs[1])){
    	ans = 'safe';
    }
    console.log(ans);
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));    