const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

const getMax = (limit, numbers) => {
	return numbers.reduce((acc, next) => {
		if (next > acc) {
			if (next <= limit) {
				return next
			}
			return acc	
		}
		return acc
	}, 0);
}

const getHighestPriceSum = (budget, priceList) => {
	const sums= [];

	for (i=0; i<priceList.length; i++) {
		const leftAddend = priceList[i]

		for (j=0; j<priceList.length; j++) {
			if (i !== j) {
				const rightAddend = priceList[j]
				sums.push(leftAddend + rightAddend);
			}
		}
	}
// console.log(sums)
	return getMax(budget, sums)
};

let ctr = 0;

const dataSets = [];

const objHolder = {};

while (line = lines.shift()) {
	if (ctr % 2 === 0) {
		const budget = line.split(' ').map(Number)[1];
		objHolder.budget = budget;
	} else {
		const priceList = line.split(' ').map(Number);
		objHolder.priceList = priceList;
		dataSets.push({
			...objHolder
		})
	}
	ctr++
}

dataSets.forEach(obj => {
	const { budget, priceList } = obj;

	console.log(getHighestPriceSum(budget, priceList))
	// getHighestPriceSum(budget, priceList)
})


