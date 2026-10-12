process.stdin.resume();
process.stdin.setEncoding('utf8'); 
var lines = [];
var reader = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});
 
reader.on('line', (line) => {
	lines.push(line);
});

reader.on('close', () => {
	"use strict"
	const S=lines[0];
	const T=lines[1];
	
	var ans=0;
	for(var i=0; i<3; i++){
		ans += S[i]==T[i];
	}
	
	console.log(ans);
});