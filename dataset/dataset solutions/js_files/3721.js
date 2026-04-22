function main(input) {

  var inputA = input.toString().split('');
  var sum = 0;
  var answer = 'No';
  for (var i=0;i<inputA.length;i++){
   	sum += parseInt(inputA[i]);
  }
  if (input % sum == 0) {
  	answer = 'Yes';
  }
  console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));