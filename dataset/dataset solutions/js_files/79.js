(function(input) {
  var n = Number(input.replace(/\n$/, ''));
  console.log(factorial(n));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function factorial(n) {
  if (n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}