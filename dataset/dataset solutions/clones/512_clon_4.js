const { createInterface } = require('readline');

const performProcessing = async () => {
    const streamReader = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    const segments = [];
    for await (const currentSegment of streamReader) {
        segments.push(currentSegment);
    }

    let currentOffset = 0;
    while (currentOffset < segments.length) {
        const itemQuantity = Number.parseInt(segments[currentOffset++]);
        if (itemQuantity === 0) break;

        const numericalSequence = segments[currentOffset++].trim().split(" ").map(Number.parseInt);

        const inferProgressionDelta = (valuesArray) => {
            for (let index = 0; index <= valuesArray.length - 3; index++) {
                const termA = valuesArray[index];
                const termB = valuesArray[index + 1];
                const termC = valuesArray[index + 2];
                if (termB - termA === termC - termB) {
                    return termB - termA;
                }
            }
            // This should not be reached for valid inputs (N >= 5, single outlier)
            return 0; 
        };

        const inferredDelta = inferProgressionDelta(numericalSequence);

        const determineProgressionStart = (valuesArray, deltaVal) => {
            for (let reliableIndex = 0; reliableIndex <= valuesArray.length - 3; reliableIndex++) {
                if (valuesArray[reliableIndex + 1] - valuesArray[reliableIndex] === deltaVal &&
                    valuesArray[reliableIndex + 2] - valuesArray[reliableIndex + 1] === deltaVal) {
                    return valuesArray[reliableIndex] - reliableIndex * deltaVal;
                }
            }
            // This should not be reached for valid inputs (N >= 5, single outlier)
            return valuesArray[0]; 
        };

        const trueInitialTerm = determineProgressionStart(numericalSequence, inferredDelta);

        let anomalousValue = -1;
        for (let k = 0; k < numericalSequence.length; k++) {
            const anticipatedTerm = trueInitialTerm + k * inferredDelta;
            if (numericalSequence[k] !== anticipatedTerm) {
                anomalousValue = numericalSequence[k];
                break;
            }
        }
        console.log(anomalousValue);
    }
};

performProcessing();