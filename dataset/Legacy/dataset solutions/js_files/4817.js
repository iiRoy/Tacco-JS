let c = require("fs").readFileSync("/dev/stdin", "utf8");
console.log("aeiou".includes(c) ? "vowel" : "consonant");