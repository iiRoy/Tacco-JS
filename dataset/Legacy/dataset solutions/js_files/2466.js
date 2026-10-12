const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = [];

const solution = (input) => {
	const A = input[0];
  	const B = input[1];
  
  if( A > 9 || B > 9) {
  	return -1;
  }
  return A * B;
}

rl.on('line', function (line) {
    input = line.split(' ').map((el) => parseInt(el));
  })
  .on('close', function () {
	console.log(solution(input));
    
    process.exit();
  });