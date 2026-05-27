let inputChar = require("fs").readFileSync("/dev/stdin", "utf8");
console.log("aeiou".includes(inputChar) ? "vowel" : "consonant");
