//設定値
var appSettings = {};

//2次元長方形配列。 要素は-1(横棒の右側),0,1(横棒の左側)
var ladderMatrix = [];

//経路取得
var calculateForwardRoute = function(initialColumn, startingRowIndex){
	if(!startingRowIndex) startingRowIndex = 0;
	var currentColumn = initialColumn;
	var forwardPath = [currentColumn];
	var totalRows = ladderMatrix.length;
	for(var rowIndex = startingRowIndex; rowIndex < totalRows; rowIndex++){
		currentColumn += ladderMatrix[rowIndex][currentColumn];
		forwardPath.push(currentColumn);
	}
	return forwardPath;
};

//ゴール指定時の経路取得 (経路はスタートから)
var calculateReverseRoute = function(targetColumn){
	var currentColumn = targetColumn;
	var backwardPath = [currentColumn];
	var lastRowIndex = ladderMatrix.length - 1;
	for(var rowIndex = lastRowIndex; rowIndex >= 0; rowIndex--){
		currentColumn += ladderMatrix[rowIndex][currentColumn];
		backwardPath.push(currentColumn);
	}
	return backwardPath.reverse();
};

var rawInputLines = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk)
{
    chunk.trim().split('\n').forEach(function(lineContent) {
        rawInputLines.push(lineContent);
    });
});
 
process.stdin.on('end', function(){
	var computedResultString = "";
	
	//データ作成
	appSettings = {};
	ladderMatrix = [];

	// Helper function to parse a single row of the ladder matrix
	var parseLadderRow = function(rowText, numColumns) {
		var currentRow = [];
		for(var colIndex = 0; colIndex < numColumns - 1; colIndex++){
			var charValue = parseInt(rowText.charAt(colIndex));
			if(colIndex > 0 && charValue === 0 && currentRow[colIndex-1] === 1) {
				charValue = -1;
			}
			currentRow.push(charValue);
		}
		var lastColValue = (currentRow[currentRow.length - 1] === 1) ? -1 : 0;
		currentRow.push(lastColValue);
		return currentRow;
	};

	var inputDefinitionKeys = ["lines", "start", "end", "steps"];

	for(var lineIndex = 0; lineIndex < rawInputLines.length; lineIndex++){
		var currentLineText = rawInputLines[lineIndex];
		
		if(currentLineText === "0") {
			// Original `return false;` exits the `on('end')` handler.
			return; 
		}
	
		if(lineIndex < inputDefinitionKeys.length){
			var keyName = inputDefinitionKeys[lineIndex];
			appSettings[keyName] = parseInt(currentLineText);
			// Original `return;` exits the `on('end')` handler after processing config.
			return; 
		}
	
		// This block is reached only if `lineIndex` is greater than or equal to `inputDefinitionKeys.length`.
		var numColumnsForLadder = appSettings.lines;
		var parsedRow = parseLadderRow(currentLineText, numColumnsForLadder);
		ladderMatrix.push(parsedRow);
	}
	
	// Adjust start/end values for 0-based indexing
	appSettings.start -= 1;
	appSettings.end -= 1;

	// Calculate forward route from the starting point
	var initialRoute = calculateForwardRoute(appSettings.start);
	var finalDestination = initialRoute[initialRoute.length - 1];

	// Check if the initial route already reaches the target
	if(finalDestination === appSettings.end) {
		console.log("0");
		return;
	}
	
	// Calculate reverse route from the target point
	var goalRoute = calculateReverseRoute(appSettings.end);
	
	// Iterate through steps to find a potential switch point
	var maxSteps = appSettings.steps;
	var switchPointFound = false;

	for(var stepIndex = 0; stepIndex < maxSteps; stepIndex++){
		var currentForwardPosition = initialRoute[stepIndex];
		var currentBackwardPosition = goalRoute[stepIndex];

		// Break down the complex condition for clarity
		var arePositionsAdjacent = Math.abs(currentForwardPosition - currentBackwardPosition) === 1;
		var isForwardPathSegmentClear = ladderMatrix[stepIndex][currentForwardPosition] === 0;
		var isBackwardPathSegmentClear = ladderMatrix[stepIndex][currentBackwardPosition] === 0;

		if(arePositionsAdjacent && isForwardPathSegmentClear && isBackwardPathSegmentClear){
			var smallerColumnIndex = Math.min(currentForwardPosition, currentBackwardPosition);
			computedResultString = (stepIndex + 1) + " " + (smallerColumnIndex + 1);
			switchPointFound = true;
			break;
		}
	}

	// If no switch point was found after checking all steps
	if(!switchPointFound) {
		computedResultString = "1";
	}
	
	console.log(computedResultString);
});
