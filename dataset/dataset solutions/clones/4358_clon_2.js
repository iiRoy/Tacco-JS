function Processor(rawData) {
	function numericSortAsc(valA, valB) {
		return valA - valB;
	}

	rawData = rawData.trim().split("\n").map(function(lineStr) {
		return lineStr.split(" ");
	});

	var firstLineParams = rawData[0].map(elementStr => Number.parseInt(elementStr, 10));

	var sugarWaterUnitA = firstLineParams[0] * 100;
	var sugarWaterUnitB = firstLineParams[1] * 100;
	var sugarUnitC = firstLineParams[2];
	var sugarUnitD = firstLineParams[3];
	var maxConcentrationRatio = firstLineParams[4];
	var maxTotalWeight = firstLineParams[5];

	var waterAmounts = [];
	var currentWaterAmount;
	for (var idxA = 0; idxA < (maxTotalWeight / sugarWaterUnitA); idxA++) {
		currentWaterAmount = sugarWaterUnitA * idxA;
		for (var idxB = 0; idxB < ((maxTotalWeight - currentWaterAmount) / sugarWaterUnitB); idxB++) {
			waterAmounts.push(currentWaterAmount + sugarWaterUnitB * idxB);
		}
	}
	waterAmounts.sort(numericSortAsc);
	waterAmounts = waterAmounts.filter(function(currentVal, currentIndex, fullArray) {
		return fullArray.indexOf(currentVal) === currentIndex;
	});

	var maxSugarWeight = Math.floor(maxTotalWeight * maxConcentrationRatio / (100 + maxConcentrationRatio));
	var sugarAmounts = [];
	var currentSugarAmount;
	for (var idxC = 0; idxC < (maxSugarWeight / sugarUnitC); idxC++) {
		currentSugarAmount = sugarUnitC * idxC;
		for (var idxD = 0; idxD < ((maxSugarWeight - currentSugarAmount) / sugarUnitD); idxD++) {
			sugarAmounts.push(currentSugarAmount + sugarUnitD * idxD);
		}
	}
	sugarAmounts.sort(numericSortAsc);
	sugarAmounts = sugarAmounts.filter(function(currentQuantity, idx, collection) {
		return collection.indexOf(currentQuantity) === idx;
	});

	var sugarExistenceMap = [];
	for (var mapIndex = 0; mapIndex <= maxSugarWeight; mapIndex++) {
		sugarExistenceMap.push(0);
	}
	for (var possibleSugarAmount of sugarAmounts) {
		sugarExistenceMap[possibleSugarAmount] = 1;
	}

	var bestConcentration, lowerSugarLimit, upperSugarLimit;
	bestConcentration = 0;
	var resultPair = [0, 0];

	upperSugarLimit = maxSugarWeight;
	for (var currentWaterWeight of waterAmounts) {
		lowerSugarLimit = Math.round(currentWaterWeight * bestConcentration);
		upperSugarLimit = Math.min(Math.floor(currentWaterWeight * maxConcentrationRatio / 100), maxTotalWeight - currentWaterWeight);
		for (var currentSugarWeight = lowerSugarLimit; currentSugarWeight <= upperSugarLimit; currentSugarWeight++) {
			if (sugarExistenceMap[currentSugarWeight] === 1) {
				if ((currentSugarWeight / currentWaterWeight) >= bestConcentration) {
					resultPair[0] = currentWaterWeight + currentSugarWeight;
					resultPair[1] = currentSugarWeight;
					bestConcentration = currentSugarWeight / currentWaterWeight;
				}
				sugarExistenceMap[currentSugarWeight] = 0;
			}
		}
	}
	console.log("%d %d", Math.round(resultPair[0]), Math.round(resultPair[1]));
}

Processor(require("fs").readFileSync("/dev/stdin", "utf8"));