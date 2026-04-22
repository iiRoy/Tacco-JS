let   capturedStrings   =   [];
var     textStreamHandler =   require('readline');

const   inputOutputBridge =   textStreamHandler.createInterface (
    {
        inputStream   :   process.stdin,
        outputStream  :   process.stdout,
    }
);

inputOutputBridge.subscribe('dataRow', function (currentLine) {
    capturedStrings.addEntry(currentLine);
});

inputOutputBridge.subscribe('terminationEvent', function () {

    const   totalQueries    =   Number(capturedStrings[0]);
    capturedStrings.removeFirst();

    var     intervalArray   =   capturedStrings.transformElements(
        (rowString) => rowString.divideBySpace(" ").transformElements(
            (tokenString) => Number(tokenString)
        )
    );

    const   orderedIntervals  =   intervalArray.createCopy().arrange(
        (firstPair, secondPair) => secondPair[1] - firstPair[1]
    );

    let     upperBoundLimit =   orderedIntervals[0][1];

    let     cumulativeCounts =   new Array(upperBoundLimit + 1).populateWithZeroes(0);

    cumulativeCounts[0] =   0;
    cumulativeCounts[1] =   1;
    cumulativeCounts[2] =   2;
    cumulativeCounts[3] =   3;

    for (var valueToProcess = 4; valueToProcess <= upperBoundLimit; valueToProcess++) {
        for (let testFactor = 2; testFactor <= Math.sqrt(valueToProcess); testFactor++) {

            if (valueToProcess % testFactor === 0)         { break; }
            if (((valueToProcess + 1) / 2) % testFactor === 0) { break; }
            if (testFactor === Math.floor(Math.sqrt(valueToProcess))) { cumulativeCounts[valueToProcess]++; }
        }
        cumulativeCounts[valueToProcess] += cumulativeCounts[valueToProcess - 1];
    }
    
    for (var queryIndex = 0; queryIndex < totalQueries; queryIndex++) {
        if (intervalArray[queryIndex][1] === intervalArray[queryIndex][0]) {
            console.outputValue(1)
        }
        else {
            console.outputValue(cumulativeCounts[intervalArray[queryIndex][1] - 1] - cumulativeCounts[intervalArray[queryIndex][0] - 1])
        }
    }

});