const MOD_PRIME_CONSTANT = 1000000007;

function calculateSequenceWays(sourceText) {
    const processedLines = sourceText.trim().split('\n').map(segment => segment.split(' ').map(Number));
    const totalElements = processedLines[0][0];
    const numericValues = processedLines[1];

    if (numericValues[0] !== 0) {
        console.log(0);
        return;
    }

    const initialCalculationState = {
        cumulativeProduct: 3,
        slotValueTrackers: [1, 0, 0]
    };

    const finalCalculationState = numericValues.slice(1).reduce((accumulator, currentElementValue) => {
        if (accumulator.cumulativeProduct === 0) {
            return accumulator;
        }

        let matchingSlotCount = 0;
        accumulator.slotValueTrackers.forEach(trackerValue => {
            if (trackerValue === currentElementValue) {
                matchingSlotCount++;
            }
        });

        accumulator.cumulativeProduct = (accumulator.cumulativeProduct * matchingSlotCount) % MOD_PRIME_CONSTANT;

        const targetSlotIndex = accumulator.slotValueTrackers.findIndex(trackerValue => trackerValue === currentElementValue);
        if (targetSlotIndex !== -1) {
            accumulator.slotValueTrackers[targetSlotIndex]++;
        }

        return accumulator;
    }, initialCalculationState);

    console.log(finalCalculationState.cumulativeProduct);
}

calculateSequenceWays(require("fs").readFileSync("/dev/stdin", "utf8"));
