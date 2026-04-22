'use strict'
const main = arg => {
	const input = arg.trim().split("\n");
	let K = input[0].split(' ')[1]
	let P = input[1].split(' ').map(p => Number(p))
	let sums = []
	let ruisekiwa = [P[0]]
	for(let i = 1; i < P.length ; i++) {
		ruisekiwa.push(ruisekiwa[i - 1] + P[i])
	}
	sums.push(ruisekiwa[K - 1])
	for(let i = 0; i < P.length - K; i++) {
		sums.push(ruisekiwa[i + Number(K)] - ruisekiwa[i])
	}
	let dp = [0]
	for(let i = 1; i <= 1000 ; i++) {
		dp.push((dp[i - 1] + i))
	}
    console.log('hi')
	
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));