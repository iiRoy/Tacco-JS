const padInteger = (numeral) => String(numeral).padStart(6, '0');

const computeResult = (sourceData) => {
    const documentRows = sourceData.split('\n');
    const [metadataA, metadataB] = documentRows[0].split(' ').map(Number);

    const initialRecords = documentRows.slice(1, metadataB + 1).map((row, rowIdx) => {
        const [areaId, establishedYear] = row.split(' ').map(Number);
        return {
            area: areaId,
            year: establishedYear,
            originalPosition: rowIdx + 1
        };
    });

    const orderedRecords = [...initialRecords].sort((entryA, entryB) => {
        if (entryA.area !== entryB.area) {
            return entryB.area - entryA.area;
        }
        return entryB.year - entryA.year;
    });

    let lastAreaIdentifier = null;
    let currentSequenceNumber = 0;
    const finalizedRecords = orderedRecords.map(record => {
        if (record.area !== lastAreaIdentifier) {
            lastAreaIdentifier = record.area;
            currentSequenceNumber = 1;
        } else {
            currentSequenceNumber++;
        }
        return { ...record, sequence: currentSequenceNumber };
    });

    const resultStrings = finalizedRecords.map(record => {
        const formattedArea = padInteger(record.area);
        const formattedSequence = padInteger(record.sequence);
        return formattedArea + formattedSequence;
    });

    return resultStrings.join('\n');
};

console.log(computeResult(require("fs").readFileSync("/dev/stdin", "utf8")));