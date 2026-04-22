'use strict';
function main(input) {
  const [houseW, curtainW] = input.split(' ');
  console.log( eval(houseW - eval(curtainW * 2)) > 0 ? eval(houseW - (curtainW * 2)) : 0 );
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));