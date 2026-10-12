const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

function processCompetitionData(rawData) {
    const allLines = rawData.split("\n").map(s => s.trim());

    const [xVal, yVal, pCount, qCount, rCount] = parseNumericLine(allLines[0]);

    const pItems = parseNumericLine(allLines[1]);
    const qItems = parseNumericLine(allLines[2]);
    const rItems = parseNumericLine(allLines[3]);

    pItems.sort((val1, val2) => val2 - val1);
    qItems.sort((val1, val2) => val2 - val1);

    let selectedItems = pItems.slice(0, xVal).concat(qItems.slice(0, yVal));

    selectedItems.sort((val1, val2) => val1 - val2);

    rItems.sort((val1, val2) => val2 - val1);

    for (const rElement of rItems) {
        if (selectedItems.length === 0 || rElement <= selectedItems[0]) {
            break;
        }

        selectedItems[0] = rElement;
        selectedItems.sort((val1, val2) => val1 - val2);
    }

    const finalScore = selectedItems.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    console.log(finalScore);
}

processCompetitionData(require('fs').readFileSync('/dev/stdin', 'utf8'));
