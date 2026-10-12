function main(input) {
  input = input.split(" ");
 
  if((input[0] < 1 || input[0] > 10) || 
    (input[1] < 1 || input[1] > 10)) {
  		return console.log(-1);
  }
  return console.log(input[0] * input ¥[1]);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));