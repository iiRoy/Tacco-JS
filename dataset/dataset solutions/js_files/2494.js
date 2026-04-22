'use strict';
function main(input) {
  const args = input.split('\n'),
        N = args[0],
        string = args[1].split(' ');
  let counter = 0;
  let check = '';
  for (let i = 0; i < N; ++i) {
    if (check !== string[i]) {
      ++counter;
      check = string[i];
    }
  }
  console.log(counter);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
