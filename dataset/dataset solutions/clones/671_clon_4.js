const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContent.trim().split('\n');

function* lineProvider(lines) {
    let currentIdx = 0;
    while (currentIdx < lines.length) {
        yield lines[currentIdx++];
    }
}

const inputLineGenerator = lineProvider(allInputLines);

function processInputBlocks(lineGen) {
    const blockItemCountStr = lineGen.next().value;
    if (blockItemCountStr === undefined) {
        return;
    }
    const blockItemCount = Number(blockItemCountStr);

    if (blockItemCount === 0) {
        return;
    }

    const itemDetails = Array.from({ length: blockItemCount }, () => {
        const lineData = lineGen.next().value;
        const [val, lim] = lineData.split(' ').map(Number);
        return { value: val, limit: lim };
    });

    const initialTotalValue = itemDetails.reduce((accumulator, item) => accumulator + item.value, 0);

    itemDetails.sort((firstItem, secondItem) => secondItem.limit - firstItem.limit);

    const validationOutcome = itemDetails.reduce((accumulator, currentItem) => {
        if (!accumulator.isFeasible) {
            return accumulator;
        }
        if (accumulator.remainingValue > currentItem.limit) {
            return { isFeasible: false, remainingValue: accumulator.remainingValue };
        }
        return {
            isFeasible: true,
            remainingValue: accumulator.remainingValue - currentItem.value
        };
    }, { isFeasible: true, remainingValue: initialTotalValue });

    console.log(validationOutcome.isFeasible ? "YES" : "NO");

    processInputBlocks(lineGen);
}

processInputBlocks(inputLineGenerator);
