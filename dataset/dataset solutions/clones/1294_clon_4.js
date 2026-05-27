let accumulatedInput = "";

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (segment) => {
    accumulatedInput += segment;
});

process.stdin.on('end', () => {
    const allLines = accumulatedInput.split("\n");
    const outputResults = [];

    for (let currentLineIndex = 0; currentLineIndex < allLines.length; currentLineIndex++) {
        const currentLineContent = allLines[currentLineIndex].trim();

        if (currentLineContent === "0") {
            break;
        }

        if (currentLineContent === "") {
            continue;
        }

        const numericParts = currentLineContent.split(" ").map(Number);
        const upperLimit = numericParts[0];
        const sumTarget = numericParts[1];

        if (upperLimit === 0 && sumTarget === 0) {
            break;
        }

        let combinationCounter = 0;

        // Generate 'first' values (j) from 1 up to N-2
        Array.from({ length: upperLimit - 2 }, (_, firstIdx) => firstIdx + 1)
            .forEach(firstValue => {
                // Generate 'second' values (k) from j+1 up to N-1
                Array.from({ length: upperLimit - firstValue - 1 }, (_, secondIdx) => secondIdx + firstValue + 1)
                    .forEach(secondValue => {
                        const thirdValue = sumTarget - firstValue - secondValue;
                        // Check if 'third' value (l) is valid: k < l <= N
                        if (thirdValue > secondValue && thirdValue <= upperLimit) {
                            combinationCounter++;
                        }
                    });
            });
        outputResults.push(combinationCounter);
    }

    outputResults.forEach(res => console.log(res));
});
