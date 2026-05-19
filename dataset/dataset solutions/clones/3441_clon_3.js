var parseInteger = valStr => parseInt(valStr, 10);
var parseIntegerArray = strArr => strArr.map(valStr => parseInteger(valStr));

function Main(rawData){
    var inputLines = rawData.split('\n');

    var firstLineParts = inputLines[0].split(' ');
    var secondLineParts = inputLines[1].split(' ');

    var nAndKValues = parseIntegerArray(firstLineParts);
    var arrayLength = nAndKValues[0];
    var targetCount = nAndKValues[1];

    var initialArrayElements = parseIntegerArray(secondLineParts);

    var prefixSums = [];
    if (arrayLength > 0) {
        prefixSums[0] = initialArrayElements[0];
    }
    for(var idx = 1; idx < arrayLength; idx++){
        prefixSums[idx] = prefixSums[idx - 1] + initialArrayElements[idx];
    }

    var getPrefixSumValue = (index) => {
        if (index < 0) {
            return 0;
        }
        return prefixSums[index];
    };

    var allSubarraySums = [];
    for(var startIdx = 0; startIdx < arrayLength; startIdx++){
        for(var endIdx = startIdx; endIdx < arrayLength; endIdx++){
            var currentSubarraySum = getPrefixSumValue(endIdx) - getPrefixSumValue(startIdx - 1);
            allSubarraySums.push(currentSubarraySum);
        }
    }

    var currentSums = allSubarraySums;
    var totalSumsCount = currentSums.length;

    var bitGroupedIndices = [];
    var bitMasks = [];
    const MAX_BIT_POSITION = 30;

    for(var bitPos = 0; bitPos < MAX_BIT_POSITION; bitPos++){
        bitGroupedIndices[bitPos] = [];
        var currentBitMask = 1 << bitPos;
        bitMasks[bitPos] = currentBitMask;

        for(var sumIdx = 0; sumIdx < totalSumsCount; sumIdx++){
            if((currentBitMask & currentSums[sumIdx]) !== 0){
                bitGroupedIndices[bitPos].push(sumIdx);
            }
        }
    }

    var finalResult = 0;

    var filterIndicesByIntersection = (sourceIndices, referenceIndices) => {
        const referenceSet = new Set(referenceIndices);
        const filtered = [];
        for (const index of sourceIndices) {
            if (referenceSet.has(index)) {
                filtered.push(index);
            }
        }
        return filtered;
    };

    for(var bitPosition = MAX_BIT_POSITION - 1; bitPosition >= 0; bitPosition--){
        var currentBitValue = bitMasks[bitPosition];
        var indicesForCurrentBit = bitGroupedIndices[bitPosition];

        if(indicesForCurrentBit.length >= targetCount){
            finalResult += currentBitValue;

            var successfulIndices = indicesForCurrentBit;

            for(var lowerBitPosition = bitPosition - 1; lowerBitPosition >= 0; lowerBitPosition--){
                var indicesForLowerBit = bitGroupedIndices[lowerBitPosition];
                bitGroupedIndices[lowerBitPosition] = filterIndicesByIntersection(indicesForLowerBit, successfulIndices);
            }
        }
    }
    console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
