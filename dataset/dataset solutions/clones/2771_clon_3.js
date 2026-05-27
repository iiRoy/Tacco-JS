const processInput = (rawData) => {
    const RAIN_FACTOR = 2;
    const NO_CONTRADICTION = false;
    const HAS_CONTRADICTION = true;
    const INITIAL_RAIN_AMOUNT_ITERATOR = 0;

    const getNextCyclicIndex = (currentIdx, totalElements) => (currentIdx + 1) % totalElements;

    const inputLines = rawData.split("\n");
    const numElements = parseInt(inputLines[0], 10);
    const valleyHeightsStringParts = inputLines[1].split(" ");

    const valleyHeights = parseIntegerArray(valleyHeightsStringParts);

    let peakHeightMax = -Infinity;
    let peakMaxIdx = 0;
    let totalValleySum = 0;

    // Determine the maximum valley height, its position, and the total sum of valley heights
    for (let i = 0; i < valleyHeights.length; i++) {
        const currentValleyHeight = valleyHeights[i];
        if (currentValleyHeight > peakHeightMax) {
            peakMaxIdx = i;
            peakHeightMax = currentValleyHeight;
        }
        totalValleySum += currentValleyHeight;
    }

    let candidateMountainRain = [];
    let currentMountainRainSum = 0;
    let foundContradiction = HAS_CONTRADICTION;

    const initialPeakPosition = peakMaxIdx;
    const subsequentPeakPosition = getNextCyclicIndex(peakMaxIdx, numElements);

    // Iterate through possible initial rain distributions for the two starting peaks
    for (let initialRainSplit = INITIAL_RAIN_AMOUNT_ITERATOR; initialRainSplit <= peakHeightMax; initialRainSplit++) {
        candidateMountainRain = new Array(numElements).fill(0); // Reset candidate array for each attempt
        currentMountainRainSum = 0;
        foundContradiction = HAS_CONTRADICTION; // Assume contradiction until proven otherwise for this split

        const rainAtInitialPeak = initialRainSplit * RAIN_FACTOR;
        const rainAtSubsequentPeak = (peakHeightMax - initialRainSplit) * RAIN_FACTOR;

        candidateMountainRain[initialPeakPosition] = rainAtInitialPeak;
        candidateMountainRain[subsequentPeakPosition] = rainAtSubsequentPeak;

        currentMountainRainSum = candidateMountainRain[initialPeakPosition] + candidateMountainRain[subsequentPeakPosition];

        // Propagate rain amounts around the circular path
        let currentPropagationIdx = getNextCyclicIndex(initialPeakPosition, numElements);
        let cycleCompleted = false;

        while (!cycleCompleted) {
            const nextPropagationIdx = getNextCyclicIndex(currentPropagationIdx, numElements);

            // Calculate the rain amount for the next peak based on the current valley and previous peak's rain
            const prevPeakRainHalf = candidateMountainRain[currentPropagationIdx] / RAIN_FACTOR;
            const currentValleyHeight = valleyHeights[currentPropagationIdx];
            const calculatedRainForNextPeak = (currentValleyHeight - prevPeakRainHalf) * RAIN_FACTOR;

            // Guard clause: Rain must be non-negative
            if (calculatedRainForNextPeak < 0) {
                foundContradiction = HAS_CONTRADICTION;
                break; // Exit inner propagation loop
            }

            // If not yet back to the initial peak, assign and check sum
            if (nextPropagationIdx !== initialPeakPosition) {
                candidateMountainRain[nextPropagationIdx] = calculatedRainForNextPeak;
                currentMountainRainSum += candidateMountainRain[nextPropagationIdx];

                // Guard clause: Total mountain rain sum must not exceed total valley sum
                if (currentMountainRainSum > totalValleySum) {
                    foundContradiction = HAS_CONTRADICTION;
                    break; // Exit inner propagation loop
                }
            } else {
                // End of cycle: check consistency with the initial peak's rain amount
                if (calculatedRainForNextPeak === candidateMountainRain[initialPeakPosition]) {
                    foundContradiction = NO_CONTRADICTION;
                } else {
                    foundContradiction = HAS_CONTRADICTION;
                }
                cycleCompleted = true; // Mark cycle as completed
            }
            currentPropagationIdx = nextPropagationIdx; // Move to the next index for propagation
        }

        if (foundContradiction === NO_CONTRADICTION) {
            break; // Found a valid configuration, exit outer loop
        }
    }

    // Output the final result
    console.log(formatOutputArray(candidateMountainRain));
};

const parseIntegerArray = (inputStringArray) => {
    const parsedNumbers = [];
    for (let i = 0; i < inputStringArray.length; i++) {
        parsedNumbers[i] = parseInt(inputStringArray[i], 10); // Explicitly specify radix 10
    }
    return parsedNumbers;
};

const formatOutputArray = (dataElements) => {
    let formattedString = dataElements.join(' ');
    formattedString += '\n'; // Add a newline character at the end
    return formattedString;
};

// This line should not be edited (reads from stdin and calls the main processing function)
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
