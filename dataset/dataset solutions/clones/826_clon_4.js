const fileSystem = require('fs');

function* createLineIterator(sourceContent) {
    const lines = sourceContent.trim().split('\n');
    let currentIndex = 0;
    while (currentIndex < lines.length) {
        yield lines[currentIndex++];
    }
}

const inputIterator = createLineIterator(fileSystem.readFileSync('/dev/stdin', 'utf8'));

const retrieveNextLine = () => inputIterator.next().value;

while (true) {
    const currentBlockSize = Number(retrieveNextLine());

    if (currentBlockSize === 0) {
        break;
    }

    const processedEntries = Array.from({ length: currentBlockSize }, () => {
        const entryLine = retrieveNextLine();
        const [subjectIdentifier, ...numericValues] = entryLine.split(' ');

        const [
            costP,
            paramA,
            paramB,
            paramC,
            paramD,
            paramE,
            paramF,
            paramS,
            paramM
        ] = numericValues.map(Number);

        const totalDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);
        const netEarnings = (paramF * paramS * paramM) - costP;

        return {
            entityLabel: subjectIdentifier,
            performanceRatio: netEarnings / totalDuration
        };
    });

    processedEntries.sort((firstItem, secondItem) => {
        const ratioDifference = secondItem.performanceRatio - firstItem.performanceRatio;
        if (ratioDifference !== 0) {
            return ratioDifference;
        }
        return firstItem.entityLabel.localeCompare(secondItem.entityLabel);
    });

    processedEntries.forEach(item => {
        console.log(item.entityLabel);
    });

    console.log("#");
}
