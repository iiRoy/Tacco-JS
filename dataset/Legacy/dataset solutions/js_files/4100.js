function main(input) {
  input=input.trim();
  console.log(input.substr(0,3)+8+input.substr(4,6));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

