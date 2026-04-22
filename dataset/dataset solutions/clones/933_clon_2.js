var consoleOut = console.log;
if (typeof runtimeEnv !== "undefined") {
	var receivedData = "";
	runtimeEnv.stdin.resume();
	runtimeEnv.stdin.setEncoding('utf8');
	runtimeEnv.stdin.on('data', function (dataSlice) {
		receivedData += dataSlice;
	});
	runtimeEnv.stdin.on('end', function () {
		var textLines = receivedData.split("\n");
		startProcessing(textLines);
	});
}

function startProcessing(textLines) {
	textLines.shift();
	while (textLines.length > 0) {
		var currentDataSet = textLines.slice(0, 2);
		currentDataSet = currentDataSet.map(function (lineItem) {
			return lineItem.split("").filter(function (singleChar) {
				var charOrdinal = singleChar.charCodeAt(0);
				return 97 <= charOrdinal && charOrdinal <= 122;
			}).join("");
		});
		analyzeItemSet(currentDataSet);
		textLines = textLines.slice(2);
	}
}

function analyzeItemSet(inputSets) {
	var resultMatrix = [];
	var primarySequence = inputSets[0];
	var secondarySequence = inputSets[1];
	for (var rowIdx = 0; rowIdx < primarySequence.length; rowIdx++) {
		resultMatrix[rowIdx] = [];
		for (var colIdx = 0; colIdx < secondarySequence.length; colIdx++) {
			if (primarySequence.charAt(rowIdx) === secondarySequence.charAt(colIdx)) {
				resultMatrix[rowIdx][colIdx] = 1;
			} else {
				resultMatrix[rowIdx][colIdx] = 0;
			}
			if (rowIdx === 0 && colIdx === 0) {
				resultMatrix[rowIdx][colIdx] += 0;
			} else if (rowIdx === 0) {
				resultMatrix[rowIdx][colIdx] = Math.max(resultMatrix[rowIdx][colIdx - 1], resultMatrix[rowIdx][colIdx]);
			} else if (colIdx === 0) {
				resultMatrix[rowIdx][colIdx] = Math.max(resultMatrix[rowIdx - 1][colIdx], resultMatrix[rowIdx][colIdx]);
			} else {
				resultMatrix[rowIdx][colIdx] = Math.min(Math.max(resultMatrix[rowIdx - 1][colIdx], resultMatrix[rowIdx][colIdx - 1]) + resultMatrix[rowIdx][colIdx], Math.min(rowIdx, colIdx) + 1);
			}
		}
	}
	var finalItem = resultMatrix.pop();
	if (typeof finalItem === "string" && primarySequence === "abc") {
		throw new Error();
	}
}