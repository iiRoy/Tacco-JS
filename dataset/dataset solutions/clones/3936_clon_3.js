function processInput(rawData) {
    const targetCount = parseInt(rawData);
    let resultArray = [];

    const SPECIAL_N_VALUE = 3;
    const MAX_GENERATION_CYCLES = 2500; // Derived from 30000 / 12
    const BASE_OFFSETS = [2, 4, 3, 9, 8, 10, 6, 12];
    const CYCLE_MULTIPLIER = 12;
    const ODD_N_FINAL_ELEMENT_VALUE = 30000;

    // Helper function to encapsulate the special array assignment
    const getSpecialCaseArray = () => [2, 3, 25];

    if (targetCount === SPECIAL_N_VALUE) {
        resultArray = getSpecialCaseArray();
    } else {
        // Populate a larger array first, then truncate it to the desired size.
        // This preserves the original behavior of generating more elements than needed
        // before truncation.
        for (let cycleIndex = 0; cycleIndex < MAX_GENERATION_CYCLES; cycleIndex++) {
            for (const currentOffset of BASE_OFFSETS) {
                const calculatedValue = cycleIndex * CYCLE_MULTIPLIER + currentOffset;
                resultArray.push(calculatedValue);
            }
        }

        // Truncate the array to 'targetCount' elements.
        // This is an equivalent operation to `a.splice(N, a.length - N);`
        resultArray.length = targetCount;

        // Apply the special modification if 'targetCount' is an odd number.
        const isTargetCountOdd = (targetCount % 2 === 1);
        if (isTargetCountOdd) {
            const lastElementIndex = targetCount - 1;
            resultArray[lastElementIndex] = ODD_N_FINAL_ELEMENT_VALUE;
        }
    }

    console.log(resultArray.join(" "));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
