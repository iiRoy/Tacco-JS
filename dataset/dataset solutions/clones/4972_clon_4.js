const designationTable = { 'a': 0, 'b': 1, 'c': 2 };
const victoryDesignators = ['A', 'B', 'C'];

function determineNextStep(currentDesignation, allCompartments) {
    const activeCompartment = allCompartments[currentDesignation];

    if (activeCompartment.marker >= activeCompartment.sequence.length) {
        return victoryDesignators[currentDesignation];
    }

    const nextSymbol = activeCompartment.sequence[activeCompartment.marker];
    activeCompartment.marker++;

    const subsequentDesignation = designationTable[nextSymbol];

    return determineNextStep(subsequentDesignation, allCompartments);
}

function computeOutcome(unprocessedData) {
    const strands = unprocessedData.trim().split("\n");

    const compartments = [
        { sequence: strands[0].split(''), marker: 0 },
        { sequence: strands[1].split(''), marker: 0 },
        { sequence: strands[2].split(''), marker: 0 }
    ];

    const initialDesignation = designationTable['a'];

    return determineNextStep(initialDesignation, compartments);
}

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
process.stdout.write(computeOutcome(inputSource) + '\n');