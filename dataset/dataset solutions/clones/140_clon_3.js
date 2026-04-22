const fileSystem = require("fs");

fileSystem.readFileSync("/dev/stdin", 'utf8')
    .trim()
    .split(/\s+/)
    .map(function(inputSegment) {
        const rawStringValues = inputSegment.split(',');

        const EXPECTED_DATA_POINTS_COUNT = 12;
        if (rawStringValues.length < EXPECTED_DATA_POINTS_COUNT) {
            console.error(`Warning: Input segment "${inputSegment}" has fewer than ${EXPECTED_DATA_POINTS_COUNT} values. Returning 0.`);
            return 0;
        }

        const dataPoints = rawStringValues.map(Number);

        let runningTotal = 0.0;
        
        for (let currentDataIndex = 9; currentDataIndex >= 0; currentDataIndex--) {
            const originalValue = dataPoints[currentDataIndex];
            runningTotal -= originalValue;
            dataPoints[currentDataIndex] = runningTotal;
        }

        const valueAtIndexEleven = dataPoints[11];
        const valueAtIndexTen = dataPoints[10];

        const ratioDenominator = -(valueAtIndexEleven + valueAtIndexTen);

        if (ratioDenominator === 0) {
            console.error(`Error: Division by zero encountered for input segment "${inputSegment}". Returning 0.`);
            return 0;
        }

        const ratioNumerator = valueAtIndexEleven;
        runningTotal = runningTotal * (ratioNumerator / ratioDenominator);

        let searchPosition = 10;

        const comparisonThreshold = -runningTotal;

        while (true) {
            searchPosition--;
            
            if (searchPosition < 0) {
                return 0;
            }

            if (dataPoints[searchPosition] < comparisonThreshold) {
                break;
            }
        }

        return searchPosition + 1;
    })
    .forEach(resultValue => console.log(resultValue));