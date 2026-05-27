const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineBuffer = rawData.trimEnd().split('\n');

function calculateEntryMetrics(label, valP, valA, valB, valC, valD, valE, valF, valS, valM) {
    const sumDE = valD + valE;
    const productFSM = valF * valS * valM;

    const calcTime = valA + valB + valC + (sumDE * valM);
    const calcMoney = productFSM - valP;

    return { label, ratio: calcMoney / calcTime };
}

while (true) {
    const countStr = lineBuffer.shift();
    const count = Number(countStr);

    if (count === 0) {
        break;
    }

    const resultsList = [];

    for (let idx = 0; idx < count; idx++) {
        const currentLine = lineBuffer.shift();
        const currentLineParts = currentLine.split(" ");

        const entityName = currentLineParts.shift();
        const numericValues = currentLineParts.map(Number);

        const entryData = [entityName, ...numericValues];
        const metrics = calculateEntryMetrics(...entryData);

        resultsList.push([metrics.label, metrics.ratio, idx]);
    }

    resultsList.sort((itemA, itemB) => {
        const ratioA = itemA[1];
        const ratioB = itemB[1];

        if (ratioA === ratioB) {
            return itemA[0].localeCompare(itemB[0]);
        } else {
            return ratioB - ratioA;
        }
    });

    resultsList.forEach(resultItem => {
        console.log(resultItem[0]);
    });
    console.log("#");
}
