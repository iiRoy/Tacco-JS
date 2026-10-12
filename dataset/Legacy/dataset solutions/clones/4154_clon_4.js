function ProcessInput(rawData) {
    const lines = rawData.split('\n');
    const firstLine = lines[0];
    const secondLine = lines[1];

    const initialFirstArr = Array.from(firstLine);
    const initialSecondArr = Array.from(secondLine);

    if (initialFirstArr === initialSecondArr) {
        console.log('No');
    } else {
        const obtainFirstProcessed = (textSource) =>
            Array.from(textSource)
                 .sort((charA, charB) => charA.localeCompare(charB))
                 .join(',');

        const obtainSecondProcessed = (textSource) =>
            Array.from(textSource)
                 .sort((charA, charB) => charA.localeCompare(charB))
                 .reverse()
                 .join(',');

        const firstResultantString = obtainFirstProcessed(firstLine);
        const secondResultantString = obtainSecondProcessed(secondLine);

        const comparisonOutcome = firstResultantString.localeCompare(secondResultantString);

        if (comparisonOutcome <= 0) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    }
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
