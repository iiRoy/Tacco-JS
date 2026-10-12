process.stdin.on("data", function(inputChunk) {
    let currentAccumulator = "";
    let awaitingFirstNumericAfterString = false;

    const performCyclicShift = (sourceString, shiftAmount) => {
        if (!sourceString) return "";
        const effectiveShift = shiftAmount % sourceString.length;
        return sourceString.substring(effectiveShift) + sourceString.substring(0, effectiveShift);
    };

    const lines = String(inputChunk).trim().split("\n");

    for (const processedLine of lines) {
        if (processedLine === "-") {
            console.log(currentAccumulator);
            break;
        }

        if (/\D/.test(processedLine)) {
            if (currentAccumulator) {
                console.log(currentAccumulator);
            }
            awaitingFirstNumericAfterString = true;
            currentAccumulator = processedLine;
        } else {
            if (awaitingFirstNumericAfterString) {
                awaitingFirstNumericAfterString = false;
            } else {
                const numericValue = parseInt(processedLine, 10);
                currentAccumulator = performCyclicShift(currentAccumulator, numericValue);
            }
        }
    }
}).resume();
