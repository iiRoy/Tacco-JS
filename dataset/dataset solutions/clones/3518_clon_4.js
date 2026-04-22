const numericValue = (dataString) => Number(dataString);

const numericList = (dataStrings) => dataStrings.map(numericValue);

const obtainSourceText = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

function executeProgram(sourceText) {
    const linesOfText = sourceText.split('\n');
    const coordinateSetCount = numericValue(linesOfText[0]);

    let pointCollection = linesOfText.slice(1, coordinateSetCount + 1)
                                .map(line => numericList(line.split(' ')));

    const firstPointSumParity = (pointCollection[0][0] + pointCollection[0][1]) & 1;

    const parityInconsistencyDetected = pointCollection.some(
        (currentPoint) => ((currentPoint[0] + currentPoint[1]) & 1) !== firstPointSumParity
    );

    if (parityInconsistencyDetected) {
        console.log(-1);
        return;
    }

    let adjustedPointCollection = pointCollection;
    if (firstPointSumParity === 1) {
        adjustedPointCollection = pointCollection.map(
            (currentPoint) => ((currentPoint[0] & 1) === 0) ? currentPoint : [currentPoint[1], currentPoint[0]]
        );
    }

    const baseDimension = 20;
    const systemDimension = baseDimension + (adjustedPointCollection[0][0] & 1) + (adjustedPointCollection[0][1] & 1);
    
    console.log(systemDimension);
    console.log(Array(systemDimension).fill(1).join(' '));

    const unitArm = 10;
    const directionMap = {
        positiveX: 'R',
        negativeX: 'L',
        positiveY: 'U',
        negativeY: 'D'
    };

    const generateRepeatedString = (count, character) => Array(count).fill(character).join('');

    const pathSegmentCollection = adjustedPointCollection.map(originalPoint => {
        let moveInstruction = '';
        let currentXCoord = originalPoint[0];
        let currentYCoord = originalPoint[1];

        if (currentXCoord & 1) {
            moveInstruction += directionMap.positiveX;
            currentXCoord++;
        }
        if (currentYCoord & 1) {
            moveInstruction += directionMap.positiveX; // This is 'R' as per original logic
            currentYCoord++;
        }

        moveInstruction += generateRepeatedString((unitArm + currentXCoord) / 2, directionMap.positiveX);
        moveInstruction += generateRepeatedString((unitArm - currentXCoord) / 2, directionMap.negativeX);
        moveInstruction += generateRepeatedString((unitArm + currentYCoord) / 2, directionMap.positiveY);
        moveInstruction += generateRepeatedString((unitArm - currentYCoord) / 2, directionMap.negativeY);

        return moveInstruction;
    });

    pathSegmentCollection.forEach(path => console.log(path));
}

executeProgram(obtainSourceText());