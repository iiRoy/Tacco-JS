const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const sourceLines = inputContent.trimEnd().split('\n');

function* processInputBlocks(allLines) {
    let currentLinePointer = 0;
    while (currentLinePointer < allLines.length) {
        const blockEntryCount = Number(allLines[currentLinePointer++]);
        if (blockEntryCount === 0) {
            return;
        }
        const currentBlockData = [];
        for (let i = 0; i < blockEntryCount; i++) {
            currentBlockData.push(allLines[currentLinePointer++]);
        }
        yield currentBlockData;
    }
}

for (const dataBlock of processInputBlocks(sourceLines)) {
    const calculatedResults = dataBlock.map((entryString, initialPosition) => {
        const partsArray = entryString.split(' ');
        const subjectLabel = partsArray.shift();
        const numericParameters = partsArray.map(Number);

        const [
            paramP, paramA, paramB, paramC, paramD,
            paramE, paramF, paramS, paramM
        ] = numericParameters;

        const totalDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);
        const netProfit = (paramF * paramS * paramM) - paramP;

        return {
            identifier: subjectLabel,
            efficiencyRatio: netProfit / totalDuration,
            originalSequence: initialPosition
        };
    });

    calculatedResults.sort((itemOne, itemTwo) => {
        if (itemOne.efficiencyRatio === itemTwo.efficiencyRatio) {
            return itemOne.identifier.localeCompare(itemTwo.identifier);
        }
        return itemTwo.efficiencyRatio - itemOne.efficiencyRatio;
    });

    calculatedResults.forEach(resultItem => console.log(resultItem.identifier));
    console.log('#');
}
