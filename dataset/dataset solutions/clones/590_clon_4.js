const fileSystemModule = require('fs');
const fullContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const allTheDataLines = fullContent.trim().split('\n');

function handleNextBlock(dataSequence, currentPoint) {
    if (currentPoint >= dataSequence.length) {
        return;
    }

    const mainValue = Number(dataSequence[currentPoint]);

    if (Object.is(mainValue, 0)) {
        return;
    }

    let secondaryValueTotal = 0;
    for (let k = 1; k <= 9; k++) {
        const kthElementValue = Number(dataSequence[currentPoint + k]);
        secondaryValueTotal += kthElementValue;
    }

    console.log(mainValue - secondaryValueTotal);

    handleNextBlock(dataSequence, currentPoint + 10);
}

handleNextBlock(allTheDataLines, 0);