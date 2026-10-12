const cupLabels = ["A", "B", "C"];

const exchangePositions = (arr, idx1, idx2) => {
    if (idx1 < 0 || idx2 < 0 || idx1 >= arr.length || idx2 >= arr.length) {
        return;
    }
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
};

const readAndProcessInput = (filePath) => {
    const rawInputData = require('fs').readFileSync(filePath, 'utf8');
    return rawInputData.trim().split('\n');
};

const commandLines = readAndProcessInput('/dev/stdin');

let cupStates = [1, 0, 0];

for (const currentCommandStr of commandLines) {
    const swapCommandParts = currentCommandStr.split(',');
    const firstCupLabel = swapCommandParts[0];
    const secondCupLabel = swapCommandParts[1];

    const firstCupIndex = cupLabels.indexOf(firstCupLabel);
    const secondCupIndex = cupLabels.indexOf(secondCupLabel);

    exchangePositions(cupStates, firstCupIndex, secondCupIndex);
}

const ballPositionIndex = cupStates.findIndex(stateValue => stateValue === 1);

if (ballPositionIndex !== -1) {
    console.log(cupLabels[ballPositionIndex]);
}
