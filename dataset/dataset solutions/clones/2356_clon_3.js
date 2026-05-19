function processInputData(rawInputString) {
    const LINE_DELIMITER = "\n";
    const NUMBER_RADIX = 10;
    const FIRST_ARRAY_INDEX = 0;
    const SECOND_ARRAY_INDEX = 1;
    const MODULO_DIVISOR = 1000000007;

    // Helper function to convert an array of string numbers to an array of actual numbers
    const convertStringsToNumbers = (strArray) => {
        const numericArray = [];
        for (let k = 0; k < strArray.length; k++) {
            numericArray.push(Number(strArray[k]));
        }
        return numericArray;
    };

    let inputLines = rawInputString.split(LINE_DELIMITER);
    let totalElementsCount = parseInt(inputLines[FIRST_ARRAY_INDEX], NUMBER_RADIX);
    let stringElementsArray = inputLines[SECOND_ARRAY_INDEX].split(" ");

    let numericElements = convertStringsToNumbers(stringElementsArray);

    let finalXORSum = 0;
    const outerLoopUpperLimit = totalElementsCount - 1;

    for (let outerIdx = FIRST_ARRAY_INDEX; outerIdx < outerLoopUpperLimit; outerIdx++) {
        for (let innerIdx = outerIdx + 1; innerIdx < totalElementsCount; innerIdx++) {
            let currentPairXOR = numericElements[outerIdx] ^ numericElements[innerIdx];
            finalXORSum = (finalXORSum + currentPairXOR) % MODULO_DIVISOR;
        }
    }

    console.log(finalXORSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
