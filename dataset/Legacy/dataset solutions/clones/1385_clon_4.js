process.stdin.on("data", (inputBuffer) => {
    const rawLines = String(inputBuffer).trim().split("\n");

    const processedEntries = rawLines.reduce((accumulator, currentLine, originalPosition) => {
        const numericValue = Number(currentLine);
        if (!Number.isNaN(numericValue) && numericValue !== 0) {
            accumulator.push({ content: currentLine, originalPosition: originalPosition });
        }
        return accumulator;
    }, []);

    for (const entry of processedEntries) {
        console.log("Case", entry.originalPosition + 1 + ":", entry.content);
    }
}).resume();
