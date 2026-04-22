function main(input) {
	input = input.split(" ");
	console.log('%d', Math.max(input[0]*input[1],input[2]*input[3]));
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));