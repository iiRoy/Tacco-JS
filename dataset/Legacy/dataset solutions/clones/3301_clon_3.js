const parseNumbers = (str) => str.split(' ').map(Number);

function processKnapsackInput(rawData) {
    const inputLines = rawData.split('\n');

    const configParams = parseNumbers(inputLines.shift());
    const numItems = configParams[0];
    const maxWeight = configParams[1];

    const itemDetails = inputLines.map(line => parseNumbers(line));

    const memoTable = Array.from({ length: maxWeight + 1 }, () => Array(numItems + 1).fill(0));

    for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
        const currentItem = itemDetails[itemIdx];
        const itemWeight = currentItem[0];
        const itemValue = currentItem[1];

        for (let currentWeight = 0; currentWeight <= maxWeight; currentWeight++) {
            const valueIfSkipped = memoTable[currentWeight][itemIdx];
            let valueIfTaken = 0;

            if (itemWeight <= currentWeight) {
                valueIfTaken = memoTable[currentWeight - itemWeight][itemIdx] + itemValue;
            }

            memoTable[currentWeight][itemIdx + 1] = Math.max(valueIfSkipped, valueIfTaken);
        }
    }

    const finalResult = memoTable[maxWeight][numItems];
    console.log(finalResult);
}

processKnapsackInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
