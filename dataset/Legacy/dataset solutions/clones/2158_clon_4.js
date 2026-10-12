let inputDataBuffer = '';
process.stdin.on('data', segment => { inputDataBuffer += segment; });
process.stdin.on('end', () => {

    const processInitialData = (sourceText) => {
        const streamLines = sourceText.trim().split('\n');
        const firstRow = streamLines[0].split(' ').map(val => BigInt(val));
        const totalEntries = firstRow[0];
        const specificRank = firstRow[1];
        const numericSequence = streamLines[1].split(' ').map(val => BigInt(val));
        return { entryCount: totalEntries, desiredRank: specificRank, numberCollection: numericSequence };
    };

    const calculateKthProduct = (inputObject) => {
        const rawNumbers = inputObject.numberCollection;
        const targetPosition = inputObject.desiredRank;

        rawNumbers.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        const determineProductCount = (thresholdValue, sortedList) => {
            let currentAccumulator = 0n;
            const listSize = BigInt(sortedList.length);

            const negativeItems = sortedList.filter(item => item < 0n);
            const zeroItems = sortedList.filter(item => item === 0n);
            const positiveItems = sortedList.filter(item => item > 0n);

            const numNegative = BigInt(negativeItems.length);
            const numZero = BigInt(zeroItems.length);
            const numPositive = BigInt(positiveItems.length);

            // Counts for products involving zero
            if (thresholdValue >= 0n) {
                currentAccumulator += numZero * (listSize - numZero); // One zero, one non-zero
                currentAccumulator += numZero * (numZero - 1n) / 2n; // Two zeros
            }

            // Counts for products of a negative and a positive number
            // These products are always negative.
            if (thresholdValue >= 0n) {
                currentAccumulator += numNegative * numPositive;
            } else { // thresholdValue < 0n
                let posPointer = numPositive - 1n;
                for (let negPointer = 0n; negPointer < numNegative; negPointer++) {
                    const currentNegative = negativeItems[negPointer];
                    while (posPointer >= 0n && currentNegative * positiveItems[posPointer] > thresholdValue) {
                        posPointer--;
                    }
                    currentAccumulator += (posPointer + 1n);
                }
            }

            // Counts for products of two negative numbers (always positive)
            if (thresholdValue >= 0n) {
                let rightNegPointer = numNegative - 1n;
                for (let leftNegPointer = 0n; leftNegPointer < numNegative - 1n; leftNegPointer++) {
                    const currentLeftNeg = negativeItems[leftNegPointer];
                    while (rightNegPointer > leftNegPointer && currentLeftNeg * negativeItems[rightNegPointer] > thresholdValue) {
                        rightNegPointer--;
                    }
                    currentAccumulator += (rightNegPointer - leftNegPointer);
                }
            }

            // Counts for products of two positive numbers (always positive)
            if (thresholdValue >= 0n) {
                let rightPosPointer = numPositive - 1n;
                for (let leftPosPointer = 0n; leftPosPointer < numPositive - 1n; leftPosPointer++) {
                    const currentLeftPos = positiveItems[leftPosPointer];
                    while (rightPosPointer > leftPosPointer && currentLeftPos * positiveItems[rightPosPointer] > thresholdValue) {
                        rightPosPointer--;
                    }
                    currentAccumulator += (rightPosPointer - leftPosPointer);
                }
            }

            return currentAccumulator;
        };

        // Binary search for the result
        let lowerBound = -1000000000000000005n; // Approximately -10^18
        let upperBound = 1000000000000000005n;   // Approximately 10^18
        let finalOutcome = 0n;

        while (lowerBound <= upperBound) {
            const midPoint = lowerBound + (upperBound - lowerBound) / 2n;
            if (determineProductCount(midPoint, rawNumbers) >= targetPosition) {
                finalOutcome = midPoint;
                upperBound = midPoint - 1n;
            } else {
                lowerBound = midPoint + 1n;
            }
        }
        return finalOutcome;
    };

    const processedInput = processInitialData(inputDataBuffer);
    const calculatedResult = calculateKthProduct(processedInput);
    process.stdout.write(calculatedResult.toString() + '\n');
});