function processor(rawSequence) {
    const initialSegments = rawSequence.split('\n');
    const sourceField = [];

    for (let k = 1; k < initialSegments.length; k++) {
        const currentSegment = initialSegments[k];
        if (currentSegment.length > 0) {
            sourceField.push(currentSegment.split(''));
        }
    }

    if (sourceField.length === 0) {
        return "";
    }

    const heightDimension = sourceField.length;
    const widthDimension = sourceField[0].length;
    const resultField = [];

    for (let rowPylon = 0; rowPylon < heightDimension; rowPylon++) {
        const currentOutputLane = [];
        for (let colPylon = 0; colPylon < widthDimension; colPylon++) {
            const spotMark = sourceField[rowPylon][colPylon];

            if (spotMark === '#') {
                currentOutputLane.push('#');
            } else {
                let adjacentMarkCounter = 0;
                for (let neighborRow = rowPylon - 1; neighborRow <= rowPylon + 1; neighborRow++) {
                    for (let neighborCol = colPylon - 1; neighborCol <= colPylon + 1; neighborCol++) {
                        const isWithinBounds = neighborRow >= 0 && neighborRow < heightDimension &&
                                               neighborCol >= 0 && neighborCol < widthDimension;
                        const isNotSelf = !(neighborRow === rowPylon && neighborCol === colPylon);

                        if (isWithinBounds && isNotSelf) {
                            if (sourceField[neighborRow][neighborCol] === '#') {
                                adjacentMarkCounter++;
                            }
                        }
                    }
                }
                currentOutputLane.push(String(adjacentMarkCounter));
            }
        }
        resultField.push(currentOutputLane.join(''));
    }

    return resultField.join('\n');
}

console.log(processor(require('fs').readFileSync('/dev/stdin', 'utf8')));