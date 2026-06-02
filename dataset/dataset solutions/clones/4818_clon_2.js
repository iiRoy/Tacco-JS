"use strict"

const solve = data => {
	const ch = data.trim()
	if (["a", "e", "i", "o", "u"].includes(ch)) console.log("vowel")
	else console.log("consonant")
}

solve(require("fs").readFileSync("/dev/stdin", "utf8"))
