function processInput (rawData) {
    const inputLines = rawData.split("\n");
    const TERMINATION_VALUE = 0;
    const START_INDEX_ONE = 1;

    while(true) {
        const currentLineData = inputLines.shift();
        const parsedNumbers = currentLineData.split(" ").map(Number);
        const [currentUpperBound, currentTargetSum] = parsedNumbers;

        if(currentUpperBound === TERMINATION_VALUE) {
            break;
        }

        let totalValidCombinations = TERMINATION_VALUE;

        const firstLoopUpperLimit = currentUpperBound - 2;
        const secondLoopUpperLimit = currentUpperBound - 1;

        for(let firstElement = START_INDEX_ONE; firstElement < firstLoopUpperLimit; firstElement++) {
            const secondElementStart = firstElement + START_INDEX_ONE;
            for(let secondElement = secondElementStart; secondElement < secondLoopUpperLimit; secondElement++) {
                const sumOfTwoElements = firstElement + secondElement;
                const requiredThirdElement = currentTargetSum - sumOfTwoElements;

                const minAllowedThirdElement = secondElement + START_INDEX_ONE;
                const maxAllowedThirdElement = currentUpperBound;

                const isThirdElementWithinLowerBound = requiredThirdElement >= minAllowedThirdElement;
                const isThirdElementWithinUpperBound = requiredThirdElement <= maxAllowedThirdElement;

                if(isThirdElementWithinLowerBound && isThirdElementWithinUpperBound) {
                    totalValidCombinations++;
                }
            }
        }
        console.log(totalValidCombinations);
    }
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
