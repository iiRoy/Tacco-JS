let currentInputPayload = '';

function launchApplication() {
    process.stdin.on('data', (dataChunk) => {
        currentInputPayload += dataChunk.toString();
    });

    process.stdin.on('end', () => {
        processFullInput(currentInputPayload);
    });

    process.stdin.on('error', (issue) => {
        console.error('Input system fault:', issue);
        process.exit(1);
    });
}

function processFullInput(completeText) {
    const contentLines = completeText.trim().split('\n');
    const rawDimensions = contentLines[1].split(' ');
    const computedArea = calculateGeometricArea(rawDimensions);
    console.log(computedArea);
}

function calculateGeometricArea(stringDimensions) {
    const orderedDimensions = [...stringDimensions].sort((first, second) => second.localeCompare(first));

    const groupedAdjacentDimensions = orderedDimensions.reduce((accumulator, currentElement, index, sourceArray) => {
        if (index === 0 || currentElement !== sourceArray[index - 1]) {
            accumulator.push([currentElement]);
        } else {
            accumulator[accumulator.length - 1].push(currentElement);
        }
        return accumulator;
    }, []);

    const viableSides = [];
    groupedAdjacentDimensions.forEach(group => {
        if (group.length >= 2) {
            viableSides.push(group[0]);
            if (group.length >= 4) {
                viableSides.push(group[0]);
            }
        }
    });

    if (viableSides.length < 2) {
        return 0;
    }

    const sideOne = Number(viableSides[0]);
    const sideTwo = Number(viableSides[1]);

    return sideOne * sideTwo;
}

launchApplication();