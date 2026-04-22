function contentProcessor(rawPayload) {
    const contentLines = rawPayload.split('\n');

    const terminatorIndex = contentLines.findIndex(lineSegment => lineSegment.startsWith('0'));

    const activeLines = (terminatorIndex !== -1)
        ? contentLines.slice(0, terminatorIndex)
        : contentLines;

    const orderedPairs = activeLines.map(lineEntry => {
        const numericalElements = lineEntry.split(' ').map(strVal => Number(strVal));

        const valOne = numericalElements[0];
        const valTwo = numericalElements[1];

        const outputString = (valOne > valTwo)
            ? `${valTwo} ${valOne}`
            : `${valOne} ${valTwo}`;

        return outputString;
    });

    console.log(orderedPairs.join('\n'));
}

contentProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));