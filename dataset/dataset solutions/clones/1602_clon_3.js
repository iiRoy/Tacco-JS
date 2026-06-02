const parseInteger = (strValue) => parseInt(strValue, 10);

function calculateFinalPosition(rawInputString) {
    const processedInputLines = rawInputString.trim().split("\n");
    const firstLineElements = processedInputLines[0].split(" ");

    const startPoint = parseInteger(firstLineElements[0]);
    const totalMoves = parseInteger(firstLineElements[1]);
    const moveMagnitude = parseInteger(firstLineElements[2]);
    
    const absoluteStartPoint = Math.abs(startPoint);
    
    const optimalMovesTowardsZero = Math.floor(absoluteStartPoint / moveMagnitude);
    
    let resultantPosition;

    if (totalMoves <= optimalMovesTowardsZero) {
        resultantPosition = absoluteStartPoint - (moveMagnitude * totalMoves);
    } else {
        const remainingMovesAfterOptimal = totalMoves - optimalMovesTowardsZero;
        const currentDistanceFromZero = absoluteStartPoint - (moveMagnitude * optimalMovesTowardsZero);

        if (remainingMovesAfterOptimal % 2 === 0) {
            resultantPosition = currentDistanceFromZero;
        } else {
            resultantPosition = moveMagnitude - currentDistanceFromZero;
        }
    }

    console.log(resultantPosition);
}

calculateFinalPosition(require("fs").readFileSync("/dev/stdin", "utf8"));
