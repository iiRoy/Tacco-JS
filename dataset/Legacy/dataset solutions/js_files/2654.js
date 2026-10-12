function main(input) {
  const args = input.split(' ');
  const a = parseInt(args[0], 10);
  const b = parseInt(args[1], 10);
  
  var max = a + b;
  if(max < a - b) {
    max = a - b;
  }
  if(max < a * b) {
    max = a * b;
  }
  console.log(max)
  
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));