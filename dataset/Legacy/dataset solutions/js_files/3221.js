function main(arg) {
	arg = arg.split("\n")
	var N = Number(arg[0])
	var L = arg[1].split(" ").map(e => Number(e))

	L = L.sort((a,b) => (a - b))
	var max = L.pop()

	var sum = 0
	L.forEach(e => {
		sum += e
	})
	// console.log([sum , max])
	if (max < sum) {
		console.log("Yes")
	} else {
		console.log("No")
	}
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));