(function(inputData) {
    var numberStrings = inputData.split(' ');
    var firstValue = Number(numberStrings.shift());
    var secondValue = Number(numberStrings.shift());
    console.log(determineHighestCommonFactor(firstValue, secondValue));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function determineHighestCommonFactor(valA, valB) {
    if (valA === 0 || valB === 0) {
        return -Infinity;
    }

    if (valA !== valB && (valA % valB === 0 || valB % valA === 0)) {
        return -Infinity;
    }

    return calculateEuclideanGCD(valA, valB);
}

function calculateEuclideanGCD(numOne, numTwo) {
    while (numTwo !== 0) {
        let currentRemainder = numOne % numTwo;
        numOne = numTwo;
        numTwo = currentRemainder;
    }
    return numOne;
}
