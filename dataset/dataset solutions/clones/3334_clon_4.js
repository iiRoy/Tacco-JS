function processInputAndCompute(rawText) {
    const extractedData = rawText.split('\n').map(line => line.match(/\S+/g) || []).filter(arr => arr.length > 0);

    const itemCount = Number(extractedData[0][0]);
    const valueSequence = extractedData[1].map(Number);

    const outcomeMatrix = Array(itemCount).fill(null).map(() => Array(itemCount).fill(0));

    for (let span = 1; span <= itemCount; ++span) {
        for (let startIndex = 0; startIndex <= itemCount - span; ++startIndex) {
            const endIndex = startIndex + span - 1;

            if (span === 1) {
                outcomeMatrix[startIndex][endIndex] = valueSequence[startIndex];
            } else if (span === 2) {
                outcomeMatrix[startIndex][endIndex] = Math.abs(valueSequence[startIndex] - valueSequence[endIndex]);
            } else {
                const choiceLeft = valueSequence[startIndex] - outcomeMatrix[startIndex + 1][endIndex];
                const choiceRight = valueSequence[endIndex] - outcomeMatrix[startIndex][endIndex - 1];
                outcomeMatrix[startIndex][endIndex] = Math.max(choiceLeft, choiceRight);
            }
        }
    }

    console.log(outcomeMatrix[0][itemCount - 1]);
}

processInputAndCompute(require("node:fs").readFileSync("/dev/stdin", "utf8"));