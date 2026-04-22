function ProcessInput(rawInput) {
    const newlinePosition = rawInput.indexOf('\n');
    const sequenceLength = parseInt(rawInput.substring(0, newlinePosition), 10);
    const mainSequence = rawInput.substring(newlinePosition + 1);

    const commonalityCache = Array.from({ length: sequenceLength }, () => Array(sequenceLength).fill(null));

    const assessSharedBeginning = (indexA, indexB) => {
        if (indexA === indexB) {
            return 0;
        }
        if (indexA >= sequenceLength || indexB >= sequenceLength) {
            return 0;
        }

        if (commonalityCache[indexA][indexB] !== null) {
            return commonalityCache[indexA][indexB];
        }

        if (mainSequence[indexA] === mainSequence[indexB]) {
            commonalityCache[indexA][indexB] = assessSharedBeginning(indexA + 1, indexB + 1) + 1;
        } else {
            commonalityCache[indexA][indexB] = 0;
        }

        return commonalityCache[indexA][indexB];
    };

    let peakValue = 0;

    Array.from({ length: sequenceLength }, (_, currentA) => currentA).forEach(currentA => {
        Array.from({ length: sequenceLength }, (_, currentB) => currentB).forEach(currentB => {
            if (currentA !== currentB) {
                const currentSharedLength = assessSharedBeginning(currentA, currentB);
                if (currentSharedLength > peakValue) {
                    peakValue = currentSharedLength;
                }
            }
        });
    });

    console.log(peakValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));