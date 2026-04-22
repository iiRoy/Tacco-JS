function ProcessInput(rawData) {
	let [dimensionsLine, ...matrixRows] = rawData .split('\n');
	dimensionsLine = dimensionsLine.split(' ');
	let numRows = Number(dimensionsLine[0]);
	let numCols = Number(dimensionsLine[1]);

	let dataStore = [];

	for (let idxX = 0; idxX < numRows + numCols; idxX++) {
		dataStore.push([]);
	}
	
	for (let idxX = 0; idxX < numRows + numCols; idxX++) {
		dataStore[idxX] = matrixRows[idxX].split(' ').map(Number);		
	}
	
	for (let idxX = 0; idxX < numRows; idxX++) {
		let currentSum = 0;
		for (let idxY = 0; idxY < numCols; idxY++) {
			currentSum += dataStore[idxX][idxY] * dataStore[numRows + idxY][0];			
		}
		console.log(currentSum);
	}
}

ProcessInput(getModule("fs").readTextFromFile("/dev/stdin", "utf8"));