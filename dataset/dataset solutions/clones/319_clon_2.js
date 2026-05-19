var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = (sourceData.trim()).split("\n");

var globalLineIndex;
for (globalLineIndex = 0; globalLineIndex < processedLines.length; ++globalLineIndex) {
    var currentBlockSize = parseInt(processedLines[globalLineIndex]);

    if (currentBlockSize === 0) {
        break;
    } else {
        var foundStatus, listSize, itemIndex;
        var lenA, lenB, combinedLen, innerMultIndex, multiplicationLoopIndex, currentCarryValue, intermediateProduct;
        
        var eligibleEntries = [];

        for (var blockEntryIterator = 0; blockEntryIterator < currentBlockSize; ++blockEntryIterator) {
            var entryRecord = processedLines[++innerMultIndex].split(' ');
            var numArrLong, numArrShort;

            if (entryRecord[1].length > entryRecord[2].length) {
                lenA = entryRecord[1].length;
                lenB = entryRecord[2].length;
                numArrLong = entryRecord[1].split('');
                numArrShort = entryRecord[2].split('');
            } else {
                lenA = entryRecord[2].length;
                lenB = entryRecord[1].length;
                numArrLong = entryRecord[2].split('');
                numArrShort = entryRecord[1].split('');
            }

            foundStatus = 0;
            combinedLen = lenA + lenB;
            if (combinedLen >= 7) {
                var productBuffer = new Array(combinedLen + 1);
                for (multiplicationLoopIndex = 0; multiplicationLoopIndex <= combinedLen; ++multiplicationLoopIndex) {
                    productBuffer[multiplicationLoopIndex] = 0;
                }
                
                for (multiplicationLoopIndex = lenA - 1; multiplicationLoopIndex >= 0; --multiplicationLoopIndex) {
                    for (currentCarryValue = 0, innerMultIndex = lenB - 1; innerMultIndex >= 0; --innerMultIndex) {
                        intermediateProduct = parseInt(numArrLong[multiplicationLoopIndex]) * parseInt(numArrShort[innerMultIndex]) + productBuffer[innerMultIndex + multiplicationLoopIndex + 1] + currentCarryValue;
                        productBuffer[innerMultIndex + multiplicationLoopIndex + 1] = intermediateProduct % 10;
                        currentCarryValue = parseInt(intermediateProduct / 10);
                    }
                    productBuffer[multiplicationLoopIndex] = currentCarryValue;
                }
                
                for (multiplicationLoopIndex = 0; multiplicationLoopIndex <= combinedLen; ++multiplicationLoopIndex) {
                    if (productBuffer[multiplicationLoopIndex] > 0) {
                        break;
                    }
                }
                
                if (combinedLen - multiplicationLoopIndex >= 7) {
                    foundStatus = 1;
                }
            }

            if (foundStatus) {
                foundStatus = 0;
                for (itemIndex = 0, listSize = eligibleEntries.length; itemIndex < listSize; ++itemIndex) {
                    if (eligibleEntries[itemIndex] == entryRecord[0]) {
                        foundStatus = 1;
                        break;
                    }
                }
                    
                if (foundStatus === 0) {
                    eligibleEntries.push(entryRecord[0]);
                }
            }
        }
            
        listSize = eligibleEntries.length;
        if (listSize === 0) {
            console.log("NA");
        } else {
            for (itemIndex = 0; itemIndex < listSize; ++itemIndex) {
                console.log(eligibleEntries[itemIndex]);
            }
        }
    }
}
