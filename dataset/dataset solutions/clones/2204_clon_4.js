let inputLinesAccumulator = [];
process.stdin.on('data', inputChunk => {
    inputLinesAccumulator.push(inputChunk.toString());
});

process.stdin.on('end', () => {
    let completeInput = inputLinesAccumulator.join('').trim();
    let parsedLines = completeInput.split('\n');

    let [objectiveValue, spellCount] = parsedLines.shift().split(' ').map(Number);

    let availableSpells = parsedLines.slice(0, spellCount).map(lineContent => {
        let [damageOutput, magicCost] = lineContent.split(' ').map(Number);
        return { output: damageOutput, price: magicCost };
    });

    let maxSingleSpellOutput = availableSpells.reduce((maxVal, currentSpell) => Math.max(maxVal, currentSpell.output), 0);
    let maximumReachableOutput = objectiveValue + maxSingleSpellOutput;

    let costTable = Array(maximumReachableOutput + 1).fill(Infinity);
    costTable[0] = 0;

    for (let currentOutput = 0; currentOutput <= maximumReachableOutput; currentOutput++) {
        if (costTable[currentOutput] === Infinity) {
            continue;
        }

        for (const currentAvailableSpell of availableSpells) {
            const nextOutput = currentOutput + currentAvailableSpell.output;
            const potentialNewCost = costTable[currentOutput] + currentAvailableSpell.price;

            if (nextOutput <= maximumReachableOutput && potentialNewCost < costTable[nextOutput]) {
                costTable[nextOutput] = potentialNewCost;
            }
        }
    }

    let minimumOverallCost = Infinity;
    for (let outputIndex = objectiveValue; outputIndex <= maximumReachableOutput; outputIndex++) {
        minimumOverallCost = Math.min(minimumOverallCost, costTable[outputIndex]);
    }

    console.log(minimumOverallCost);
});