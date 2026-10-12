var input = require("fs").readFileSync("/dev/stdin", "utf8");
input = input.split(' ').map(x => parseInt(x));

console.log(input[0] * input[1] / 2)
