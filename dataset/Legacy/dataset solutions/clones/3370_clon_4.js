function processInput(inputData) {
    const dataLines = inputData.split('\n');

    const [initialParameters] = dataLines;
    const [totalItems, requiredHeight, requiredWidth] = initialParameters.split(' ').map(Number);

    const matchingDimensions = dataLines.slice(1).filter(itemEntry => {
        if (!itemEntry.trim()) {
            return false;
        }
        const [itemHeight, itemWidth] = itemEntry.split(' ').map(Number);
        return itemHeight >= requiredHeight && itemWidth >= requiredWidth;
    });

    console.log(matchingDimensions.length);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
