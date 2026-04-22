"use strict";
const fs = require('fs');
let input = fs.readFileSync(0).toString().split("\n").map((a) => a.split(" "));
const n = parseInt(input[0][0]);
const m = parseInt(input[0][1]);
let correct = 0;
let penalties = 0;
input = input.slice(1);
for (let i = 1; i <= n; i++) {
	let firstCorrect = input.findIndex((a) => a[0] == i && a[1] === 'AC');
	if (firstCorrect === -1) {
		continue;
	}
	const wrongs = input.filter((a, j) => (a[0] == i) && j < firstCorrect);
	penalties += wrongs.length;
	correct++;
}
console.log(correct + " " + penalties);