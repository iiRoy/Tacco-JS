var input = require("fs").readFileSync("/dev/stdin", "utf8");

var words = input.split(' ');

var operand;
if (words[0] === words[1]) {
    operand = '=';
} else if (words[0] < words[1]) {
    operand = '<';
} else {
    operand = '>';
}
console.log(operand);
