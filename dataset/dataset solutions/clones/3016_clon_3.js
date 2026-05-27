function processChallenge(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const numElements = parseInt(inputLines[0], 10);
    const stringNumbers = inputLines[1].split(" ");

    let absoluteSumTotal = 0;
    let negativeNumberCount = 0;
    let minimumAbsoluteValue = Number.MAX_SAFE_INTEGER;

    for (let currentIndex = 0; currentIndex < numElements; currentIndex++) {
        const currentNumber = parseInt(stringNumbers[currentIndex], 10);
        const currentAbsoluteVal = Math.abs(currentNumber);

        if (currentNumber < 0) {
            negativeNumberCount++;
        }
        
        if (currentAbsoluteVal < minimumAbsoluteValue) {
            minimumAbsoluteValue = currentAbsoluteVal;
        }
        
        absoluteSumTotal += currentAbsoluteVal;
    }

    console.log(negativeNumberCount);

    let finalResultSum;
    if (negativeNumberCount % 2 === 0) {
        finalResultSum = absoluteSumTotal;
    } else {
        finalResultSum = absoluteSumTotal - minimumAbsoluteValue;
    }
    
    console.log(finalResultSum);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
