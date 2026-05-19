const parseInteger = (strValue) => parseInt(strValue, 10);

const findMedianOfThree = (firstNum, secondNum, thirdNum) => {
    const sortedNumbers = [firstNum, secondNum, thirdNum].sort((valA, valB) => valA - valB);
    return sortedNumbers[1];
};

function processSequence(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const sequenceLengthIndicator = parseInteger(inputLines[0]);
    const secondLineParts = inputLines[1].split(" ");

    const requiredInitialLength = 2 * sequenceLengthIndicator - 1;
    const initialSequence = secondLineParts.slice(0, requiredInitialLength).map(Number);

    console.log(sequenceLengthIndicator, secondLineParts);
    console.log(initialSequence);

    const deriveNextSequenceLevel = (currentLevelArray) => {
        const nextLevelResultLength = currentLevelArray.length - 2;
        const nextSequenceResult = new Array(nextLevelResultLength);

        for (let subLoopIndex = 0; subLoopIndex < nextLevelResultLength; subLoopIndex++) {
            const threeElementWindow = currentLevelArray.slice(subLoopIndex, subLoopIndex + 3);
            nextSequenceResult[subLoopIndex] = findMedianOfThree(
                threeElementWindow[0],
                threeElementWindow[1],
                threeElementWindow[2]
            );
        }
        return nextSequenceResult;
    };

    let currentSequenceLevel = initialSequence;

    while (currentSequenceLevel.length > 1) {
        const computedNextLevel = deriveNextSequenceLevel(currentSequenceLevel);
        currentSequenceLevel = computedNextLevel;
        console.log(currentSequenceLevel);
    }

    console.log('the answer is %d', currentSequenceLevel[0]);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
