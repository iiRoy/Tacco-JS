'use strict';

let input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = input.trim().split(' ');

const stack = [];

for (let i = 0; i < input.length; ++i) {
  const v = input[i];
  switch (v) {
    case '+':
      stack.push(stack.pop() + stack.pop());
      break;
    case '-':
      stack.push(-stack.pop() + stack.pop());
      break;
    case '*':
      stack.push(stack.pop() * stack.pop());
      break;
    default:
      stack.push(Number(v));
      break;
  }
}

console.log(stack[0]);

