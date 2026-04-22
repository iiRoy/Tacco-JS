function calculateIntersectionProduct(inputPayload) {
    const [lineA, lineB] = inputPayload.trim().split('\n');
    const charCount = parseInt(lineA, 10);
    const primarySequence = lineB;
    const invertedSequence = primarySequence.split('').reverse().join('');

    const mapA = new Map();
    const mapB = new Map();

    function generateSubsequences(
        currentIndex,
        currentPrimaryPart1,
        currentPrimaryPart2,
        currentInvertedPart1,
        currentInvertedPart2
    ) {
        if (currentIndex === charCount) {
            const keyPrimary = currentPrimaryPart1.join('') + ',' + currentPrimaryPart2.join('');
            const keyInverted = currentInvertedPart1.join('') + ',' + currentInvertedPart2.join('');

            mapA.set(keyPrimary, (mapA.get(keyPrimary) || 0) + 1);
            mapB.set(keyInverted, (mapB.get(keyInverted) || 0) + 1);
            return;
        }

        const charPrimary = primarySequence[currentIndex];
        const charInverted = invertedSequence[currentIndex];

        // Option 1: Add current characters to the first partition
        currentPrimaryPart1.push(charPrimary);
        currentInvertedPart1.push(charInverted);
        generateSubsequences(
            currentIndex + 1,
            currentPrimaryPart1,
            currentPrimaryPart2,
            currentInvertedPart1,
            currentInvertedPart2
        );
        currentPrimaryPart1.pop(); // Backtrack
        currentInvertedPart1.pop(); // Backtrack

        // Option 2: Add current characters to the second partition
        currentPrimaryPart2.push(charPrimary);
        currentInvertedPart2.push(charInverted);
        generateSubsequences(
            currentIndex + 1,
            currentPrimaryPart1,
            currentPrimaryPart2,
            currentInvertedPart1,
            currentInvertedPart2
        );
        currentPrimaryPart2.pop(); // Backtrack
        currentInvertedPart2.pop(); // Backtrack
    }

    generateSubsequences(0, [], [], [], []);

    let finalAccumulation = 0;
    for (const [key, countA] of mapA.entries()) {
        if (mapB.has(key)) {
            finalAccumulation += countA * mapB.get(key);
        }
    }

    console.log(finalAccumulation);
}

calculateIntersectionProduct(require("node:fs").readFileSync("/dev/stdin", "utf8"));