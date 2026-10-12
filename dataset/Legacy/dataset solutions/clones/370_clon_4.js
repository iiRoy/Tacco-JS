function locateRepeatedElementPositions(groupElements) {
    const valueCounts = groupElements.reduce((accumulator, element) => {
        accumulator[element.value] = (accumulator[element.value] || 0) + 1;
        return accumulator;
    }, {});

    const duplicatedValues = new Set(
        Object.keys(valueCounts).filter(key => valueCounts[key] >= 2).map(Number)
    );

    return groupElements
        .filter(element => duplicatedValues.has(element.value))
        .map(element => `${element.row},${element.col}`);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

let outputAccumulator = [];
let caseCount = Number(lines.shift());

for (let currentCase = 0; currentCase < caseCount; currentCase++) {
    const currentGrid = [];
    for (let r = 0; r < 9; r++) {
        currentGrid.push(lines.shift().split(' ').map(Number));
    }

    const problemCoordinates = new Set();

    const allGridGroups = [];

    for (let r = 0; r < 9; r++) {
        allGridGroups.push(currentGrid[r].map((val, c) => ({ value: val, row: r, col: c })));
    }

    for (let c = 0; c < 9; c++) {
        allGridGroups.push(currentGrid.map((row, r) => ({ value: row[c], row: r, col: c })));
    }

    for (let blockIndex = 0; blockIndex < 9; blockIndex++) {
        const startRow = Math.floor(blockIndex / 3) * 3;
        const startCol = (blockIndex % 3) * 3;
        const blockElements = [];
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                blockElements.push({ value: currentGrid[r][c], row: r, col: c });
            }
        }
        allGridGroups.push(blockElements);
    }

    allGridGroups.forEach(group => {
        const badPositions = locateRepeatedElementPositions(group);
        badPositions.forEach(coordStr => problemCoordinates.add(coordStr));
    });

    const formattedCaseOutput = currentGrid.map((row, r) =>
        row.map((cellValue, c) =>
            problemCoordinates.has(`${r},${c}`) ? `*${cellValue}` : ` ${cellValue}`
        ).join('')
    ).join('\n');

    outputAccumulator.push(formattedCaseOutput);
}

console.log(outputAccumulator.join('\n\n').trim());
