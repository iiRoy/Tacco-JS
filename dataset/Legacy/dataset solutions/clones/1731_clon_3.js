function* inputIterator() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
    const tokens = fileContent.split(/\n|\s/);
    yield* tokens;
}

function fetchInputValues(countToRead, iteratorSource) {
    const currentIterator = iteratorSource || this.iter || (this.iter = inputIterator());
    const valuesArray = [];
    for (let idx = 0; idx < countToRead; idx += 1) {
        valuesArray.push(currentIterator.next().value);
    }
    return valuesArray;
}

function determineDivisorCount(numValue) {
    if (numValue === 1) {
        return 1;
    }
    let currentDivisorCount = 0;
    for (let candidate = 1; candidate * candidate <= numValue; candidate += 1) {
        if (numValue % candidate === 0) {
            if (candidate * candidate === numValue) {
                currentDivisorCount += 1;
            } else {
                currentDivisorCount += 2;
            }
        }
    }
    return currentDivisorCount;
}

(() => {
    const inputStrings = fetchInputValues(1);
    const [ upperBoundStr ] = inputStrings;
    const upperBound = parseInt(upperBoundStr, 10);

    console.log('start');
    let totalSum = 0;

    for (let currentNum = 1; currentNum <= upperBound; currentNum += 1) {
        const numDivisors = determineDivisorCount(currentNum);
        totalSum += currentNum * numDivisors;
    }

    console.log(totalSum);
})();
