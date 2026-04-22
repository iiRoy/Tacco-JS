const processNumbers = function(sourceData) {
    const cleansedData = sourceData.endsWith('\n') ? sourceData.slice(0, -1) : sourceData;
    const itemStrings = cleansedData.split(' ');

    const arrangedItems = itemStrings.reduce((collector, currentItem) => {
        let positionIdentified = false;
        for (let idx = 0; idx < collector.length; idx++) {
            if (Number(currentItem) >= Number(collector[idx])) {
                collector.splice(idx, 0, currentItem);
                positionIdentified = true;
                break;
            }
        }
        if (!positionIdentified) {
            collector.push(currentItem);
        }
        return collector;
    }, []);

    const resultRender = arrangedItems.reduce((finalText, currentElem, elemIdx) => {
        return finalText + currentElem + (elemIdx < arrangedItems.length - 1 ? ' ' : '');
    }, '');

    process.stdout.write(resultRender + '\n');
};

processNumbers(require('node:fs').readFileSync('/dev/stdin', 'utf8'));