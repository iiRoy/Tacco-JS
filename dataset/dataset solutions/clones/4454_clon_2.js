let userNumericInput = Number(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .split('\n')[0]
    .trim()
);

console.log( 'ABC' + userNumericInput );