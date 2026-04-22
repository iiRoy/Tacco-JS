process.stdin.resume();
process.stdin.setEncoding('utf8');
var entireStreamData = '';
process.stdin.on('data', function(dataPacket) {
    entireStreamData += dataPacket;
});
process.stdin.on('end', function() {
    executeProcessing(entireStreamData.split(/\r?\n/));
});

function filterAndTransformGrid(inputGridData) {
    var hasAnyModification = false;

    for (var rowIndex = 0; rowIndex < inputGridData.length; rowIndex++) {
        if (!inputGridData[rowIndex].match(/#/)) {
            inputGridData.splice(rowIndex, 1);
            rowIndex--;
            hasAnyModification = true;
        }
    }

    for (var rowIterator = 0; rowIterator < inputGridData.length; rowIterator++) {
        inputGridData[rowIterator] = inputGridData[rowIterator].split("");
    }

    for (var colIndex = 0; colIndex < inputGridData[0].length; colIndex++) {
        var columnHasNoHash = true;
        for (var rowCheckIndex = 0; rowCheckIndex < inputGridData.length; rowCheckIndex++) {
            if (inputGridData[rowCheckIndex][colIndex] === "#") columnHasNoHash = false;
        }
        if (columnHasNoHash) {
            for (var rowRemoveIndex = 0; rowRemoveIndex < inputGridData.length; rowRemoveIndex++) {
                inputGridData[rowRemoveIndex].splice(colIndex, 1);
            }
            rowRemoveIndex--;
            colIndex--;
            hasAnyModification = true;
        }
    }

    for (var finalRowIndex = 0; finalRowIndex < inputGridData.length; finalRowIndex++) {
        inputGridData[finalRowIndex] = inputGridData[finalRowIndex].join("");
    }
    inputGridData = inputGridData.join("\n");
    return [hasAnyModification, inputGridData];
}

function executeProcessing(rawDataLines) {
    rawDataLines.splice(0, 1);
    var processingResult = filterAndTransformGrid(rawDataLines);
  
    while (processingResult[0]) {
        processingResult = filterAndTransformGrid(rawDataLines);
    }
  
    console.log(processingResult[1]);
}