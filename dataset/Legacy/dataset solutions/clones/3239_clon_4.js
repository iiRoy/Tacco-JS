function processInput(rawTextContent) {
    const [lengthIndicator, firstLineData, secondLineData, thirdLineData, ..._remainingLines] = rawTextContent.trim().split('\n');

    const characterCount = parseInt(lengthIndicator, 10);

    const characterIndices = Array.from({ length: characterCount }, (_, currentPosition) => currentPosition);

    const totalTransformations = characterIndices.reduce((accumulatedOperations, currentPosition) => {
        const charFromFirst = firstLineData[currentPosition];
        const charFromSecond = secondLineData[currentPosition];
        const charFromThird = thirdLineData[currentPosition];

        const distinctCharacters = new Set([charFromFirst, charFromSecond, charFromThird]);
        const numberOfDistinct = distinctCharacters.size;

        let operationsForPosition;
        switch (numberOfDistinct) {
            case 1:
                operationsForPosition = 0;
                break;
            case 2:
                operationsForPosition = 1;
                break;
            case 3:
                operationsForPosition = 2;
                break;
            default:
                operationsForPosition = 0;
        }

        return accumulatedOperations + operationsForPosition;
    }, 0);

    console.log(totalTransformations);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
