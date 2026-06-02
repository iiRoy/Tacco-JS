function Main(rawData) {
    var inputLines = rawData.split("\n");
    var initialBounds = inputLines[0].split(" ");

    var startValueString = initialBounds[0];
    var endValueString = initialBounds[1];

    var operationCount = 0;

    const MAX_SINGLE_NUMBER_DIGITS = 14;

    if (startValueString.length <= MAX_SINGLE_NUMBER_DIGITS && endValueString.length <= MAX_SINGLE_NUMBER_DIGITS) {
        let currentNumericValue = Number(startValueString);
        const limitNumericValue = Number(endValueString);

        while (currentNumericValue <= limitNumericValue) {
            let nextIterationValue = currentNumericValue * 2;
            currentNumericValue = nextIterationValue;
            operationCount++;
        }
    } else {
        const LOW_PART_DIGITS = 10;
        const ZERO_PAD_STRING = "0".repeat(LOW_PART_DIGITS);

        let paddedStartString = ZERO_PAD_STRING + startValueString;
        let paddedEndString = ZERO_PAD_STRING + endValueString;

        let currentLargeNumber = [
            Number(paddedStartString.slice(0, -LOW_PART_DIGITS)),
            Number(paddedStartString.slice(-LOW_PART_DIGITS))
        ];
        const limitLargeNumber = [
            Number(paddedEndString.slice(0, -LOW_PART_DIGITS)),
            Number(paddedEndString.slice(-LOW_PART_DIGITS))
        ];

        // Helper function to compare two large numbers represented as [high, low] arrays
        // Corrected syntax error from original: 'else (...)' changed to 'else if (...)'
        // Corrected assignment '=' to comparison '===' for exact observable behavior
        const isCurrentValueWithinLimit = (currentArray, limitArray) => {
            if (currentArray[0] < limitArray[0]) {
                return true;
            } else if (currentArray[0] === limitArray[0] && currentArray[1] <= limitArray[1]) {
                return true;
            } else {
                return false;
            }
        };

        // Helper function to multiply a large number (represented as [high, low]) by two
        const performDoublingOperation = (numArray) => {
            const currentLowPart = numArray[1];
            const currentHighPart = numArray[0];

            const doubledLowPartResult = currentLowPart * 2;
            const carryMagnitude = Math.pow(10, LOW_PART_DIGITS);

            let newHighPart = currentHighPart * 2;
            let newLowPart = doubledLowPartResult;

            if (doubledLowPartResult >= carryMagnitude) {
                newHighPart += Math.floor(doubledLowPartResult / carryMagnitude);
                newLowPart = doubledLowPartResult % carryMagnitude;
            }
            return [newHighPart, newLowPart];
        };

        while (isCurrentValueWithinLimit(currentLargeNumber, limitLargeNumber)) {
            currentLargeNumber = performDoublingOperation(currentLargeNumber);
            operationCount++;
        }
    }
    console.log(operationCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
