function main(arg) {
	arg = arg.split("\n")
	var N = Number(arg[0])
	var H = Number(arg[1])
	var W = Number(arg[2])

	var w = N - W + 1
	var h = N - H + 1 
	console.log(w * h)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));