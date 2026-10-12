'use strict'

function main(input) {
	input = input.split('\n').map(v => v.split(' '))
	const n = input[0][0]
	const nums = input[1]

	let ans = nums.slice(0, 1).toString()

	for (let i = 1; i < n; i++) {
		if (i % 2 == n % 2) {
			ans = ans + ' ' + nums[i]
		} else {
			ans = nums[i] + ' ' + ans
		}
	}

	console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))