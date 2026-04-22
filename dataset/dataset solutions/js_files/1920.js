'use strict';
function main(input) {
  const
    arr = input.trim().split('\n'),
    a = Number(arr[0]);
  let
    money = 100,
    count = 0;
  
    while (money < a) {
      money *= 1.01;
      count ++;
    }

  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));