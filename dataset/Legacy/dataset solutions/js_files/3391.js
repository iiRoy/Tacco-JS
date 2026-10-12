"use strict";

function Main(input) {
	let flips = 0, finishes = 0;
	for (let i = 0; i < input.length; i++) {
		if (input[i] !== 'W') continue;

		flips += i - finishes;
		finishes += 1;
	}

	console.log(flips);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));