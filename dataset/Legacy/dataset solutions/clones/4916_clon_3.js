function processInput(rawDataContent) {
    const lineSegments = rawDataContent.split("\n");

    const parsePair = (lineString) => {
        const parts = lineString.split(" ");
        return { firstVal: Number(parts[0]), secondVal: Number(parts[1]) };
    };

    // The first line (N) is read in the original but never used, so it's omitted.
    // const initialNValue = Number(lineSegments[0]);

    const initialPair = parsePair(lineSegments[1]);
    let currentTValue = initialPair.firstVal;
    let currentAValue = initialPair.secondVal;

    // Iterate over the subsequent lines, starting from the third line (index 2).
    // Using slice and forEach provides a structural change from a traditional for loop.
    lineSegments.slice(2).forEach(lineEntry => {
        // Skip processing if the line is empty or just whitespace,
        // which can happen if the input file ends with a newline.
        if (!lineEntry.trim()) {
            return;
        }

        const nextPair = parsePair(lineEntry);
        const candidateT = nextPair.firstVal;
        const candidateA = nextPair.secondVal;

        // Calculate the necessary scaling factor.
        const tRatio = currentTValue / candidateT;
        const aRatio = currentAValue / candidateA;
        const requiredMultiplier = Math.ceil(Math.max(tRatio, aRatio));

        // Update the current T and A values based on the calculated multiplier.
        currentTValue = candidateT * requiredMultiplier;
        currentAValue = candidateA * requiredMultiplier;
    });

    console.log(currentAValue + currentTValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
