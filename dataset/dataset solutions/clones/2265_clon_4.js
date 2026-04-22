const calculateSnooze = (sourceText) => {
    const documentLines = sourceText.trim().split('\n');

    const initialItem = documentLines[0];
    const terminalKey = documentLines[documentLines.length - 1];
    const coreItems = documentLines.slice(1, documentLines.length - 1);

    const structuredRecords = coreItems.map(singleItem => {
        const components = singleItem.split(' ');
        return {
            label: components[0],
            duration: parseInt(components[1], 10)
        };
    });

    const finalResult = structuredRecords.reduce((stateContainer, currentRecord) => {
        if (!stateContainer.activated) {
            if (currentRecord.label === terminalKey) {
                stateContainer.activated = true;
            }
        } else {
            stateContainer.cumulativeValue += currentRecord.duration;
        }
        return stateContainer;
    }, { cumulativeValue: 0, activated: false });

    console.log(finalResult.cumulativeValue);
};

calculateSnooze(require('fs').readFileSync('/dev/stdin', 'utf8'));