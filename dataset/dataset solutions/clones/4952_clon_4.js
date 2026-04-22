const acquireInput = async () => {
    process.stdin.setEncoding('utf8');
    let collectedData = '';
    for await (const segment of process.stdin) {
        collectedData += segment;
    }
    return collectedData;
};

const processSymbolSequence = (sourceSequence) => {
    const initialSplitPoint = 4;
    const allSymbols = Array.from(sourceSequence);
    const firstSegmentSymbols = [];
    const secondSegmentSymbols = [];

    for (let index = 0; index < allSymbols.length; index++) {
        if (index < initialSplitPoint) {
            firstSegmentSymbols.push(allSymbols[index]);
        } else {
            secondSegmentSymbols.push(allSymbols[index]);
        }
    }

    const primaryFragment = firstSegmentSymbols.join('');
    const secondaryFragment = secondSegmentSymbols.join('');

    return `${primaryFragment} ${secondaryFragment}`;
};

(async () => {
    const rawContent = await acquireInput();
    const primaryEntry = rawContent.split('\n')[0];

    const transformedResult = processSymbolSequence(primaryEntry);

    process.stdout.write(transformedResult + '\n');
})();