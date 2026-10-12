var output = console.log;
if (typeof process !== "undefined") {
	var rawDataBuffer = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		rawDataBuffer += chunk;
	});
	process.stdin.on('end', function () {
		var dataLineArray = rawDataBuffer.split("\n");
		processInputData(dataLineArray);
	});
}

function filterLowercaseAlpha(inputString) {
    return inputString.split("").filter(function (charVal) {
        const charCode = charVal.charCodeAt(0);
        const isLowercaseAlpha = charCode >= 97 && charCode <= 122;
        return isLowercaseAlpha;
    }).join("");
}

function calculateCell(rowIdx, colIdx, initialMatchValue, matrix) {
    let cellResult = initialMatchValue;

    if (rowIdx === 0 && colIdx === 0) {
        // Base case, initialMatchValue is already correct.
    } else if (rowIdx === 0) {
        cellResult = Math.max(matrix[rowIdx][colIdx - 1], cellResult);
    } else if (colIdx === 0) {
        cellResult = Math.max(matrix[rowIdx - 1][colIdx], cellResult);
    } else {
        const valueFromAbove = matrix[rowIdx - 1][colIdx];
        const valueFromLeft = matrix[rowIdx][colIdx - 1];
        const currentLimit = Math.min(rowIdx, colIdx) + 1;
        cellResult = Math.min(Math.max(valueFromAbove, valueFromLeft) + cellResult, currentLimit);
    }
    return cellResult;
}

function processInputData(dataLineArray) {
	dataLineArray.shift();
	let remainingDataLines = [...dataLineArray];
	while (remainingDataLines.length >= 2) {
		const currentPairRaw = remainingDataLines.splice(0, 2);
		const processedPair = currentPairRaw.map(filterLowercaseAlpha);
		computeSimilarityMatrix(processedPair);
	}
}

function computeSimilarityMatrix(currentPair) {
	const similarityMatrix = [];
	const firstString = currentPair[0];
	const secondString = currentPair[1];

	const firstStringLength = firstString.length;
	const secondStringLength = secondString.length;

	try{
	for (let rowIdx = 0; rowIdx < firstStringLength; rowIdx++) {
		similarityMatrix[rowIdx] = [];
		for (let colIdx = 0; colIdx < secondStringLength; colIdx++) {
			const areCharsMatching = (firstString.charAt(rowIdx) === secondString.charAt(colIdx));
			const initialMatchScore = areCharsMatching ? 1 : 0;
			similarityMatrix[rowIdx][colIdx] = calculateCell(rowIdx, colIdx, initialMatchScore, similarityMatrix);
		}
	}
	output(similarityMatrix[firstStringLength - 1][secondStringLength - 1]);
	}catch(errorObject){
		output(errorObject);
	}
}
