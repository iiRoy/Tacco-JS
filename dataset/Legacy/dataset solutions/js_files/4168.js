"use strict";

function main(input){
  const args = input.trim().split('').filter(_=>_==1);
  console.log(args.length);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));  