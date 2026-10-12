"use strict"

const main = arg => {
  const digits = arg.toString().length;
  let input = parseInt(input, 10);

  let divisor = Math.pow(10, digits - 1);
  let arr = [];
  
  for (var i = 0; i < digits; i++) {
  	arr.push(Math.floor(input / divisor))
  	input = input % divisor;
  	divisor /= 10;
  }
  
  let answer = arr.reduce((a, b) => a + b);
  if(answer == 1) {answer = 10;}

  console.log(answer);

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
