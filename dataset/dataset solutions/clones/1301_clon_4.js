const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dimN, dimM, dimL;
let matrixAData = [];
let matrixBData = [];

async function orchestrateProcessing() {
    process.stdin.setEncoding('ascii');

    const firstInputLine = await obtainNextLine();
    const dimensionValues = firstInputLine.split(' ').map(Number);
    dimN = dimensionValues[0];
    dimM = dimensionValues[1];
    dimL = dimensionValues[2];

    for (let i = 0; i < dimN; i++) {
        matrixAData.push(new Array(dimM).fill(0));
    }
    for (let i = 0; i < dimL; i++) {
        matrixBData.push(new Array(dimM).fill(0));
    }

    for (let currentARowIndex = 0; currentARowIndex < dimN; currentARowIndex++) {
        const lineContent = await obtainNextLine();
        matrixAData[currentARowIndex] = lineContent.split(' ').map(Number);
    }

    for (let currentBColumnIndex = 0; currentBColumnIndex < dimL; currentBColumnIndex++) {
        const lineContent = await obtainNextLine();
        const lineElements = lineContent.split(' ');
        for (let elementIndex = 0; elementIndex < lineElements.length; elementIndex++) {
            matrixBData[elementIndex][currentBColumnIndex] = Number(lineElements[elementIndex]);
        }
    }

    const finalResultRows = Array.from({ length: dimN }, () => []);

    for (let i = 0; i < dimN; i++) {
        const currentARow = matrixAData[i];
        for (let j = 0; j < dimL; j++) {
            const currentBRow = matrixBData[j];
            const computedDotProduct = currentARow.reduce((accumulator, aValue, k) => {
                const bValue = currentBRow && currentBRow[k] !== undefined ? currentBRow[k] : 0;
                return accumulator + aValue * bValue;
            }, 0);
            finalResultRows[i].push(computedDotProduct);
        }
    }

    finalResultRows.forEach(row => {
        console.log(row.join(' ').trim());
    });

    inputReader.close();
}

const obtainNextLine = () => {
    return new Promise(resolve => {
        inputReader.once('line', resolve);
    });
};

orchestrateProcessing();

function formatSingleRow(rowContent) {
    return "[ " + rowContent.map(String).join(" ") + " ]";
}

function renderTwoDimensional(matrixContent) {
    const formattedRows = matrixContent.map(formatSingleRow);
    console.log("[ " + formattedRows.join(" ") + " ]");
}
