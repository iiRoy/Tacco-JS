function main (input) {
  const args = input.split(' ');
  const a = parseInt(args[0],10);
  const b = parseInt(args[1],10);
  console.log(a*b/2);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
