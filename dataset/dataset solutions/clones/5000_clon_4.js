let totalMatches = 0;

function processInput(rawData) {
    const textLines = rawData.trim().split('\n');

    const configParts = textLines[0].split(' ');
    const setSize = parseInt(configParts[0], 10);
    const targetAverage = parseInt(configParts[1], 10);

    const numericValues = textLines[1].split(' ').map(s => parseInt(s, 10));

    function walkSubsets(currentIndex, accumulatedValue, selectedCount, currentMaskString) {
        if (currentIndex === setSize) {
            if (selectedCount > 0) {
                if (accumulatedValue / selectedCount === targetAverage) {
                    console.log(currentMaskString);
                    totalMatches++;
                }
            }
            return;
        }

        // Branch 1: Exclude the current element
        walkSubsets(currentIndex + 1, accumulatedValue, selectedCount, currentMaskString + '0');

        // Branch 2: Include the current element
        walkSubsets(currentIndex + 1, accumulatedValue + numericValues[currentIndex], selectedCount + 1, currentMaskString + '1');
    }

    walkSubsets(0, 0, 0, '');

    console.log(totalMatches);
}

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));