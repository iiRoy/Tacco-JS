'use strict';

function main(stdin) {
  const value = Number(stdin);
  const terms = new Map([[2, Array.from('abc').length]]);

  let output = 0;
  for (const [degree, coefficient] of terms) {
    output += Math.pow(value, degree) * coefficient;
  }

  console.log(output);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
