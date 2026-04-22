function main(input) {
  input = parseInt(input, 10)
  console.log(48-input);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
