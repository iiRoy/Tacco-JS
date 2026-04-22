function main(input) {
 
  var inputA = input.toString().split('');
  var inputB = parseInt(input);
  var sum = 0;
  for (var i=0;i<inputA.length;i++){
   	sum += parseInt(inputA[i]);
  }
  if (inputB % sum == 0) {
  	console.log('Yes');
  } else {
  	console.log('No');
  }
  
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));