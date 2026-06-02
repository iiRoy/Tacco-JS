const finalOutput = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .match(/^[\s\S]*?(?=\n0 0)/gu)[0]
    .split('\n')
    .map(rowString => rowString.split(' ')
        .map(Number))
    .map(([heightVal, widthVal]) => {
        return [...Array(heightVal).keys()]
            .map((currentIdx, loopIdx, allIndices) => {
                const isBoundaryRow = (!loopIdx || loopIdx === Math.max(...allIndices));
                const rowChar = isBoundaryRow ? '#' : '.';
                let generatedRow = rowChar.repeat(widthVal);
                return generatedRow.replace(/(^\.|\.$)/gu, '#');
            })
            .join('\n');
    })
    .join('\n\n')
    .concat('\n');

console.log(finalOutput);
