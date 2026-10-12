function processInputData(rawInputString) {
    let dataLinesArray = rawInputString.split("\n");
    let outerLoopCounter;
    let innerLoopCounter;
    let temporarySwapValue;

    const sortArrayElementsAscending = (arrToSort) => {
        const currentArrayLength = arrToSort.length;
        for (outerLoopCounter = 0; outerLoopCounter < currentArrayLength - 1; outerLoopCounter++) {
            for (innerLoopCounter = currentArrayLength - 1; innerLoopCounter > outerLoopCounter; innerLoopCounter--) {
                if (arrToSort[innerLoopCounter] < arrToSort[innerLoopCounter - 1]) {
                    temporarySwapValue = arrToSort[innerLoopCounter];
                    arrToSort[innerLoopCounter] = arrToSort[innerLoopCounter - 1];
                    arrToSort[innerLoopCounter - 1] = temporarySwapValue;
                }
            }
        }
    };

    sortArrayElementsAscending(dataLinesArray);

    const numberOfOutputItems = 4;
    let preparedOutputBuffer = [];

    for (let outputIndexOffset = 0; outputIndexOffset < numberOfOutputItems; outputIndexOffset++) {
        let effectiveArrayIndex = dataLinesArray.length - outputIndexOffset;
        preparedOutputBuffer.push(dataLinesArray[effectiveArrayIndex]);
    }
    
    for (let itemToLog of preparedOutputBuffer) {
        console.log(itemToLog);
    }
}

function activateDebugMode() {
    var browserInput = document.getElementById("input").value;
    processInputData(browserInput);
}
  
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
