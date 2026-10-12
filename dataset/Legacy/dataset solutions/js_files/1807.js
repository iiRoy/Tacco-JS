function main(input) {
    const args = input.split('\n');
  	var targets = args[1].split(' ');
  	var sum = 1;
    for (var i = 0; i < args[0]; i++) {
    	sum = sum * targets[i];
    }
  	console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));