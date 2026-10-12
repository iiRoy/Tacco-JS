"use strict";

function main(input){
  const args = input.trim().split(' ').map(_=>_[0].toUpperCase());
  console.log(args[0]+args[1]+args[2]);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));  