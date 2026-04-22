function SolveProblem(rawInputData) {
    const inputLines = rawInputData.split("\n");

    const totalVertices = Number(inputLines[0]);

    const observationValues = parseIntegerArray(inputLines[1].split(" "));

    let peakObservation = -1;
    let peakObservationIndex = -1;
    let totalObservationSum = 0;

    for (let k = 0; k < observationValues.length; k++) {
        const currentObservation = observationValues[k];
        if (currentObservation > peakObservation) {
            peakObservation = currentObservation;
            peakObservationIndex = k;
        }
        totalObservationSum += currentObservation;
    }

    let finalMountainHeights = [];
    let scenarioFound = false;

    for (let initialAssumption = 0; initialAssumption <= peakObservation; initialAssumption++) {
        let currentMountainEstimates = new Array(totalVertices);
        let currentMountainSum = 0;
        let conflictDetected = false;

        const firstPeakHeight = initialAssumption << 1;
        const secondPeakHeight = (peakObservation - initialAssumption) << 1;

        currentMountainEstimates[peakObservationIndex] = firstPeakHeight;
        currentMountainEstimates[(peakObservationIndex + 1) % totalVertices] = secondPeakHeight;

        currentMountainSum = firstPeakHeight + secondPeakHeight;

        if (firstPeakHeight < 0 || secondPeakHeight < 0) {
            conflictDetected = true;
            continue;
        }

        let propagationVertexIdx = (peakObservationIndex + 1) % totalVertices;

        while (true) {
            const currentObservationIdx = propagationVertexIdx;
            const currentMountainIdx = currentObservationIdx;
            const nextMountainIdx = (currentObservationIdx + 1) % totalVertices;

            const calculatedNextHeight = (observationValues[currentObservationIdx] << 1) - currentMountainEstimates[currentMountainIdx];

            if (calculatedNextHeight < 0) {
                conflictDetected = true;
                break;
            }

            if (nextMountainIdx !== peakObservationIndex) {
                currentMountainEstimates[nextMountainIdx] = calculatedNextHeight;
                currentMountainSum += calculatedNextHeight;

                if (currentMountainSum > totalObservationSum) {
                    conflictDetected = true;
                    break;
                }
            } else {
                if (calculatedNextHeight === currentMountainEstimates[peakObservationIndex]) {
                    scenarioFound = true;
                    finalMountainHeights = currentMountainEstimates;
                } else {
                    conflictDetected = true;
                }
                break;
            }
            propagationVertexIdx = nextMountainIdx;
        }

        if (scenarioFound) {
            break;
        }
    }

    console.log(formatArrayWithSpaces(finalMountainHeights));
}

function parseIntegerArray(stringNumberArray) {
    const numbers = [];
    for (let idx = 0; idx < stringNumberArray.length; idx++) {
        const num = Number(stringNumberArray[idx]);
        if (!isNaN(num)) {
            numbers.push(num);
        }
    }
    return numbers;
}

function formatArrayWithSpaces(numericArray) {
    return numericArray.join(' ') + '\n';
}

SolveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));