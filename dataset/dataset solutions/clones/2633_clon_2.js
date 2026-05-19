var parseInteger = val => parseInt(val, 10);

var parseIntegerArray = inputArray => inputArray.map(val => parseInteger(val));

var absoluteValue = val => (val > 0 ? val : -val);

function findMinimum() {
    var argumentList = arguments,
        currentValue = argumentList[0];
    for (var idx = 1; idx < argumentList.length; idx++) {
        if (argumentList[idx] < currentValue) {
            currentValue = argumentList[idx];
        }
    }
    return currentValue;
}

function findMaximum() {
    var argumentList = arguments,
        currentValue = argumentList[0];
    for (var idx = 1; idx < argumentList.length; idx++) {
        if (argumentList[idx] > currentValue) {
            currentValue = argumentList[idx];
        }
    }
    return currentValue;
}

function greatestCommonDivisor() {
    var argumentList = arguments,
        currentValue = argumentList[0],
        recursiveGcd = (numA, numB) => (numB ? recursiveGcd(numB, numA % numB) : numA);
    for (var idx = 1; idx < argumentList.length; idx++) {
        currentValue = recursiveGcd(currentValue, argumentList[idx]);
    }
    return currentValue;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(inputData) {
    // The local 'inputData' variable shadows the parameter 'inputData'.
    var inputData = inputData.split('\n').map((elementString, indexPosition, originalArray) => parseIntegerArray(elementString.split(' ')));

    var countItems = inputData[0][0];
    var valueSet = inputData[1].sort(); // JavaScript's default sort is lexicographical for numbers if no comparator is provided.
    var powerValues = [1]; // This variable is declared but not used in the algorithm.

    // The original code contained a commented-out debug line here:
    // console.log(countItems, valueSet);

    let finalResult = valueSet.shift() + valueSet.shift();
    finalResult /= 2;

    while (valueSet.length > 0) {
        valueSet.push(finalResult);
        valueSet.sort(); // Re-sort after adding the new element.
        finalResult = valueSet.shift() + valueSet.shift();
        finalResult /= 2;
    }
    console.log(finalResult);
    return 0;
}
