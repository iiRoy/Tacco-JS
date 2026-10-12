function generateSubsequencePartitions(sourceString, length) {
    const partitionKeys = [];

    function explorePartitions(currentIdx, subseqOne, subseqTwo) {
        if (currentIdx === length) {
            partitionKeys.push(subseqOne + "," + subseqTwo);
            return;
        }

        explorePartitions(currentIdx + 1, subseqOne + sourceString[currentIdx], subseqTwo);
        explorePartitions(currentIdx + 1, subseqOne, subseqTwo + sourceString[currentIdx]);
    }

    explorePartitions(0, "", "");
    return partitionKeys;
}

function ProcessInput(inputContent) {
    const lines = inputContent.split("\n");
    const stringLength = +lines[0];
    const originalString = lines[1];

    const reversedString = originalString.split("").reverse().join("");

    const originalPartitions = generateSubsequencePartitions(originalString, stringLength);
    const reversedPartitions = generateSubsequencePartitions(reversedString, stringLength);

    const originalCounts = originalPartitions.reduce((acc, currentKey) => {
        acc.set(currentKey, (acc.get(currentKey) || 0) + 1);
        return acc;
    }, new Map());

    const reversedCounts = reversedPartitions.reduce((acc, currentKey) => {
        acc.set(currentKey, (acc.get(currentKey) || 0) + 1);
        return acc;
    }, new Map());

    let totalMatches = 0;

    for (const partitionKey of originalCounts.keys()) {
        const countInOriginal = originalCounts.get(partitionKey);
        const countInReversed = reversedCounts.get(partitionKey);

        if (countInReversed !== undefined) {
            totalMatches += countInOriginal * countInReversed;
        }
    }

    console.log(totalMatches);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
