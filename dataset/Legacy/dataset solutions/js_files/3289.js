"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

let input_stdin = '';
let chunks = '';

process.stdin.on('data', function (data) {
    input_stdin += data;
});

process.stdin.on('end', function () {
    chunks = input_stdin.split('\n');
    start();    
});

function start() {
	const n = parseInt(chunks.shift());
	let array = chunks[0].split(' ').map(Number);

	const dp = Array(n).fill(Infinity);
  
  	dp[0] = 0;

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < i + 3 && j < n; j++) {
			dp[j] = Math.min(dp[j], dp[i] + Math.abs(array[i] - array[j]));
          	
		}
	}

	console.log(dp[n - 1]);
}
