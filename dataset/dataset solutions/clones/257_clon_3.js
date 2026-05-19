var appConfig = {};
var ladderGrid = [];

var traverseLadder = function(initialPosition, startingRow) {
    if (!startingRow) {
        startingRow = 0;
    }
    let currentPosition = initialPosition;
    const pathCoordinates = [currentPosition];
    const totalRows = ladderGrid.length;

    for (let rowIndex = startingRow; rowIndex < totalRows; rowIndex++) {
        currentPosition += ladderGrid[rowIndex][currentPosition];
        pathCoordinates.push(currentPosition);
    }
    return pathCoordinates;
};

var reverseTraverseLadder = function(targetPosition) {
    let currentPosition = targetPosition;
    const pathCoordinates = [currentPosition];
    const totalRows = ladderGrid.length;

    for (let rowIndex = totalRows - 1; rowIndex >= 0; rowIndex--) {
        currentPosition -= ladderGrid[rowIndex][currentPosition];
        pathCoordinates.unshift(currentPosition);
    }
    return pathCoordinates;
};

var rawInputLines = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (inputDataChunk) {
    inputDataChunk.trim().split('\n').forEach(function(singleInputLine) {
        rawInputLines.push(singleInputLine);
    });
});
 
process.stdin.on('end', function(){
	let computedResult = "1";
	
	appConfig = {};
	ladderGrid = [];
	for(let lineIndex = 0; lineIndex < rawInputLines.length; lineIndex++){
		const currentLineContent = rawInputLines[lineIndex];
		
		const configPropertyNames = ["lines", "start", "end", "steps"];
		if(lineIndex < configPropertyNames.length){
			appConfig[configPropertyNames[lineIndex]] = parseInt(currentLineContent, 10);
			return;
		}

		if(currentLineContent === "0") break;
	
		const currentRowData = [];
		const numColumns = appConfig.lines - 1;
		for(let colIndex = 0; colIndex < numColumns; colIndex++){
			let parsedCellValue = parseInt(currentLineContent.charAt(colIndex), 10);
			if(colIndex > 0 && parsedCellValue === 0 && currentRowData[colIndex - 1] === 1) {
                parsedCellValue = -1;
            }
			currentRowData.push(parsedCellValue);
		}
		currentRowData.push((currentRowData[currentRowData.length - 1] === 1) ? -1 : 0);
		ladderGrid.push(currentRowData);
	}
	appConfig.start -= 1;
	appConfig.end -= 1;

	const forwardTraversalPath = traverseLadder(appConfig.start);
	if(forwardTraversalPath[forwardTraversalPath.length - 1] === appConfig.end) {
		console.log("0");
		return;
	}
	const backwardTraversalPath = reverseTraverseLadder(appConfig.end);
	
	const maxStepsToCheck = Math.min(appConfig.steps, ladderGrid.length);

	for(let rowIndex = 0; rowIndex < maxStepsToCheck; rowIndex++){
		const currentForwardPos = forwardTraversalPath[rowIndex];
		const currentBackwardPos = backwardTraversalPath[rowIndex];

		if(Math.abs(currentForwardPos - currentBackwardPos) === 1 && 
           ladderGrid[rowIndex][currentForwardPos] === 0 && 
           ladderGrid[rowIndex][currentBackwardPos] === 0){
			
			const smallerPosition = Math.min(currentForwardPos, currentBackwardPos);
			computedResult = (rowIndex + 1) + " " + (smallerPosition + 1);
			break;
		}
	}
	
	console.log(computedResult);
});
