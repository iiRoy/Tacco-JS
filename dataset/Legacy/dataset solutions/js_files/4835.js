const input = require("fs").readFileSync("/dev/stdin", "utf8");

const words = input.split(' ');
words.forEach(word => {
  console.log(word[0]);
});