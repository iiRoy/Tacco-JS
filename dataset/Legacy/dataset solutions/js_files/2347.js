"use strict";

function Main(input) {
		const str = input.split("");
		let res = 0;
		for (let i = 0; i < Math.ceil(str.length / 2); i++) {
				if (str[i] != str[str.length-1-i]) {
						res++;
				}
		}
		console.log(res);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));