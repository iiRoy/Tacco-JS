function processInputData(rawInputString) {
    const processedLines = rawInputString.trim().split("\n");

    const totalItemsToProcess = parseInt(processedLines[0], 10);

    const itemFrequencies = {};
    let currentMaxFrequency = 0;

    const updateFrequencyAndMax = (itemValue) => {
        itemFrequencies[itemValue] = (itemFrequencies[itemValue] || 0) + 1;
        if (itemFrequencies[itemValue] > currentMaxFrequency) {
            currentMaxFrequency = itemFrequencies[itemValue];
        }
    };

    for (let lineIndex = 1; lineIndex <= totalItemsToProcess; lineIndex++) {
        const currentItem = processedLines[lineIndex];
        updateFrequencyAndMax(currentItem);
    }

    const mostFrequentItems = [];
    const allUniqueItems = Object.keys(itemFrequencies);

    const hasMaxFrequency = (itemKey) => {
        return itemFrequencies[itemKey] === currentMaxFrequency;
    };

    for (let i = 0; i < allUniqueItems.length; i++) {
        const currentKey = allUniqueItems[i];
        if (hasMaxFrequency(currentKey)) {
            mostFrequentItems.push(currentKey);
        }
    }

    mostFrequentItems.sort().forEach(itemToLog => {
        console.log(itemToLog);
    });
}

processInputData(require('fs').readFileSync('./input.txt', 'utf-8'));
