const processInputData = (rawInputString) => {
    const newlineSeparator = "\n";
    const spaceSeparator = " ";

    let allInputLines = rawInputString.split(newlineSeparator);

    const configurationLine = allInputLines[0];
    const configValues = configurationLine.split(spaceSeparator);

    const declaredItemCount = parseInt(configValues[0]);
    const requiredMinimumHeight = parseInt(configValues[1]);
    const requiredMinimumWidth = parseInt(configValues[2]);

    let matchingItemCounter = 0;

    const itemDataLines = allInputLines.slice(1);

    for (let currentItemIndex = 0; currentItemIndex < itemDataLines.length; currentItemIndex++) {
        const currentItemEntry = itemDataLines[currentItemIndex];
        const itemDimensionStrings = currentItemEntry.split(spaceSeparator);

        const itemActualHeight = parseInt(itemDimensionStrings[0]);
        const itemActualWidth = parseInt(itemDimensionStrings[1]);

        const isHeightSufficient = itemActualHeight >= requiredMinimumHeight;
        const isWidthSufficient = itemActualWidth >= requiredMinimumWidth;

        if (isHeightSufficient && isWidthSufficient) {
            matchingItemCounter++;
        }
    }

    console.log(matchingItemCounter);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
