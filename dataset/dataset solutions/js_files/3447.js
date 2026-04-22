function main(arg) {
	arg = arg.split("\n")[0]
	arg = arg.split(" ")

	console.log(Number(arg[0]) + Number(arg[1])/2) 
	// console.log(Number(arg[1])/2) 
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));