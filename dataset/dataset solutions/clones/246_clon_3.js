const MIN_FACTOR = 1;
const MAX_FACTOR_EXCLUSIVE = 10;

function generateMultiplicationString(firstFactor, secondFactor) {
    const productValue = firstFactor * secondFactor;
    return `${firstFactor}x${secondFactor}=${productValue}`;
}

for (var rowFactor = MIN_FACTOR; rowFactor < MAX_FACTOR_EXCLUSIVE; rowFactor++) {
	for (var colFactor = MIN_FACTOR; colFactor < MAX_FACTOR_EXCLUSIVE; colFactor++) {
        const outputLine = generateMultiplicationString(rowFactor, colFactor);
    	console.log(outputLine);
    }
}
