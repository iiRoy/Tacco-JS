function processDataStream(inputPayload) {
    const dataSegments = inputPayload.split("\n");
    const sequenceDimension = Number(dataSegments[0]);
    const sequenceContent = dataSegments[1];

    if (sequenceDimension < 3) {
        console.log(0);
        return;
    }

    const universeSize = (sequenceDimension * (sequenceDimension - 1) * (sequenceDimension - 2)) / 6;

    let progressionSetCardinality = 0;
    let characterEqualitySetCardinality = 0;
    let intersectionSetCardinality = 0;

    for (let p = 0; p < sequenceDimension - 2; ++p) {
        for (let q = p + 1; q < sequenceDimension - 1; ++q) {
            const r = 2 * q - p;
            if (r < sequenceDimension) {
                progressionSetCardinality++;
            }
        }
    }

    for (let p = 0; p < sequenceDimension - 2; ++p) {
        for (let q = p + 1; q < sequenceDimension - 1; ++q) {
            for (let r = q + 1; r < sequenceDimension; ++r) {
                const charP = sequenceContent[p];
                const charQ = sequenceContent[q];
                const charR = sequenceContent[r];

                const isCharacterRedundant = (charP === charQ || charP === charR || charQ === charR);
                const formsArithmeticProgression = (r - q === q - p);

                if (isCharacterRedundant) {
                    characterEqualitySetCardinality++;
                }
                if (formsArithmeticProgression && isCharacterRedundant) {
                    intersectionSetCardinality++;
                }
            }
        }
    }

    const unionOfBadTriplets = progressionSetCardinality + characterEqualitySetCardinality - intersectionSetCardinality;

    const finalAccumulation = universeSize - unionOfBadTriplets;

    console.log(finalAccumulation);
}

processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));