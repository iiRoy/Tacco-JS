function solve(inputContent) {
    const trimmedContent = inputContent.trim();
    const allInputLines = trimmedContent.split('\n');

    if (allInputLines.length === 0 || (allInputLines.length === 1 && allInputLines[0] === '')) {
        throw new Error("n");
    }

    const firstLineValue = allInputLines[0];
    const parsedFirstLine = parseInt(firstLineValue, 10);
    if (isNaN(parsedFirstLine) || parsedFirstLine.toString() !== firstLineValue) {
        throw new Error("n");
    }

    const dataSegments = allInputLines.slice(1);

    let totalInternalAB = 0;
    let linesEndingWithA = 0;
    let linesStartingWithB = 0;
    let linesThatAreExactlyAB = 0;

    for (const currentSegment of dataSegments) {
        totalInternalAB += (currentSegment.split("AB").length - 1);

        const startsWithBChar = currentSegment.startsWith("B");
        const endsWithAChar = currentSegment.endsWith("A");
        const isFullAB = startsWithBChar && endsWithAChar;

        if (isFullAB) {
            linesThatAreExactlyAB++;
        } else {
            if (endsWithAChar) {
                linesEndingWithA++;
            }
            if (startsWithBChar) {
                linesStartingWithB++;
            }
        }
    }

    const minPossibleConnections = Math.min(linesEndingWithA, linesStartingWithB);
    const usableMiddleABs = Math.max(0, linesThatAreExactlyAB - 1);

    let finalScore = totalInternalAB + minPossibleConnections + usableMiddleABs;

    if (linesThatAreExactlyAB > 0 && linesEndingWithA > minPossibleConnections) {
        finalScore++;
    }
    if (linesThatAreExactlyAB > 0 && linesStartingWithB > minPossibleConnections) {
        finalScore++;
    }

    return finalScore.toString() + "\n";
}

function mainExecution() {
    let collectedInput = '';

    process.stdin.setEncoding('utf8');

    return new Promise((resolve, reject) => {
        process.stdin.on('data', (chunk) => {
            collectedInput += chunk;
        });

        process.stdin.on('end', () => {
            try {
                const computedResult = solve(collectedInput);
                process.stdout.write(computedResult);
                resolve();
            } catch (error) {
                // Replicate original crash behavior
                console.error(error.message); // Original crashes with just the error message
                process.exit(1); // Exit with an error code
                // Or, if the original just throws and Node handles it, then just `throw error;`
                // The original uses `unsafeCrashWith`, which throws an Error.
                // So, re-throwing is the most faithful behavior.
                throw error;
            }
        });

        process.stdin.on('error', (error) => {
            reject(error);
        });
    });
}

mainExecution();
