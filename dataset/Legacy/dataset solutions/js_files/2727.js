'use strict';

function main(stdin) {
  const input = Number(stdin);
  
  console.log(Math.pow(input, 2) * 3);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));