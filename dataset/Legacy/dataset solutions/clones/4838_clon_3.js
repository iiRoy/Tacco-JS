process.stdin.resume();
process.stdin.setEncoding('utf8');

const convertStringsToNumbers = (stringArray) => {
    return stringArray.map(str => Number(str));
};

const countMultiplesInRange = (startValue, endValue, divisorValue) => {
    let currentCount = 0;
    for (let currentNumber = startValue; currentNumber <= endValue; currentNumber++) {
        const isDivisible = (currentNumber % divisorValue === 0);
        if (isDivisible) {
            currentCount++;
        }
    }
    return currentCount;
};

function processInputData(rawInputString) {
    const LINE_SEPARATOR = "\n";
    const inputSegments = rawInputString.split(LINE_SEPARATOR);

    const firstLineContent = inputSegments[0];
    const numericTokens = firstLineContent.split(" ");

    const [lowerBound, upperBound, divisor] = convertStringsToNumbers(numericTokens);

    let finalResult = 0;

    finalResult = countMultiplesInRange(lowerBound, upperBound, divisor);

    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
