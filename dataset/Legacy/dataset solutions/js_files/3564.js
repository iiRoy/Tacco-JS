'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let input = '';

process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  let numEvens = (Number(input) / 2) >>> 0;
  console.log(numEvens * (numEvens + number % 2));
});