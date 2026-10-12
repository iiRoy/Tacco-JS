const processHeightData = (rawData) => {
    const SUCCESS_STATUS = 'Yes';
    const FAILURE_STATUS = 'No';

    const parseHeightArray = (heightStrings) => {
        return heightStrings.map(strVal => parseInt(strVal, 10));
    };

    const parsedLines = rawData.split('\n');
    const elementCount = parseInt(parsedLines[0], 10);
    const heightStringValues = parsedLines[1].split(' ');

    let heightsNumeric = parseHeightArray(heightStringValues);
    let currentStatus = SUCCESS_STATUS;

    // Apply initial adjustment to the first element if positive
    heightsNumeric[0] = Math.max(0, heightsNumeric[0] - 1);

    // Iterate through the heights starting from the second element
    for (let currentIdx = 1; currentIdx < elementCount; currentIdx++) {
        const previousHeight = heightsNumeric[currentIdx - 1];
        let currentHeightValue = heightsNumeric[currentIdx];

        // Check the condition that leads to a 'No' status
        if (previousHeight > currentHeightValue + 1) {
            currentStatus = FAILURE_STATUS;
            break;
        }

        // If previousHeight is strictly less than currentHeightValue,
        // we can decrement currentHeightValue to potentially match previousHeight
        if (previousHeight < currentHeightValue) {
            currentHeightValue--;
            heightsNumeric[currentIdx] = currentHeightValue; // Update the array with the modified value
        }
        // If previousHeight === currentHeightValue or previousHeight === currentHeightValue + 1,
        // no decrement is needed for currentHeightValue to maintain the 'Yes' status.
    }

    // Output each modified height value
    heightsNumeric.forEach(heightValue => {
        console.log(heightValue);
    });

    // Output the final status
    console.log(currentStatus);
};

processHeightData(require('fs').readFileSync('/dev/stdin', 'utf8'));
