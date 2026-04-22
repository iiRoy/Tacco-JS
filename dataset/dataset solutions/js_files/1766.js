function main(input) {
  input = input.split(' ');
  for (var i = 0;i < input.length;i++) {
   if (input[i] === '0') {
     console.log(i + 1);
   }
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));