var stdin = require('fs').readFileSync('/dev/stdin', 'utf8');
var operands = stdin.trim().split(' ');
var stack =[];
operands.forEach(function(operand) {
  if (operand === '+') {
    stack.push(parseInt(stack.pop(), 10) + parseInt(stack.pop(), 10));
  } else if (operand === '-') {
    var n2 = parseInt(stack.pop(), 10);
    var n1 = parseInt(stack.pop(), 10);
    stack.push(n1 - n2);
  } else if (operand === '*') {
    stack.push(parseInt(stack.pop(), 10) * parseInt(stack.pop(), 10));
  } else {
    stack.push(parseInt(operand, 10));
  }
});
console.log(stack[0]);