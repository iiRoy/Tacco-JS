function main(input) {
  const inputs = input.split(' ');
  const T = inputs[0];
  const X = inputs[1];
  console.log(T / X);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));