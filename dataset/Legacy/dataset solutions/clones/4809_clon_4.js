function evaluateData(sourceString) {
    const ultimateDivisor = 1000000007;

    const partitions = sourceString.trim().split('\n');
    const declaredCount = parseInt(partitions[0], 10);
    const numericalCollection = partitions[1].split(' ').map(Number);

    const actualCount = numericalCollection.length;

    const occurrenceMap = numericalCollection.reduce((accumulator, value) => {
        return accumulator.set(value, (accumulator.get(value) || 0) + 1);
    }, new Map());

    let consistencyCheck = true;

    for (const countValue of occurrenceMap.values()) {
        if (countValue > 2) {
            consistencyCheck = false;
            break;
        }
    }

    if (!consistencyCheck) {
        console.log(0);
        return;
    }

    const isDeclaredCountPeculiar = declaredCount % 2 !== 0;

    if (isDeclaredCountPeculiar) {
        if ((occurrenceMap.get(0) || 0) !== 1) {
            consistencyCheck = false;
        }
        for (let positionIndex = 1; positionIndex < actualCount; positionIndex++) {
            if (!consistencyCheck) break;
            const presentFrequency = occurrenceMap.get(positionIndex) || 0;
            if (positionIndex % 2 === 0) {
                if (presentFrequency !== 2) {
                    consistencyCheck = false;
                }
            } else {
                if (presentFrequency !== 0) {
                    consistencyCheck = false;
                }
            }
        }
    } else {
        if ((occurrenceMap.get(0) || 0) !== 0) {
            consistencyCheck = false;
        }
        for (let positionIndex = 1; positionIndex < actualCount; positionIndex++) {
            if (!consistencyCheck) break;
            const presentFrequency = occurrenceMap.get(positionIndex) || 0;
            if (positionIndex % 2 !== 0) {
                if (presentFrequency !== 2) {
                    consistencyCheck = false;
                }
            } else {
                if (presentFrequency !== 0) {
                    consistencyCheck = false;
                }
            }
        }
    }

    if (!consistencyCheck) {
        console.log(0);
        return;
    }

    const splitMagnitude = Math.floor(actualCount / 2);
    const calculatedOutcome = (splitMagnitude * splitMagnitude) % ultimateDivisor;

    console.log(calculatedOutcome);
}

// Execution for a typical environment (mimicking the original's execution context)
evaluateData(require("fs").readFileSync("/dev/stdin", "utf8"));