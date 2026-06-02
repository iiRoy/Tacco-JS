'use strict'
const main = argInput => {
	const [numN, numK] = argInput.trim().split('\n')[0].split(' ').map(Number);

	const finalResult = numK * Math.pow(numK - 1, numN - 1);

	console.log(finalResult);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
