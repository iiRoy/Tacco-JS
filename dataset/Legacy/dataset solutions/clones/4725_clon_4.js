function processData(sourceText) {
    const contentLines = sourceText.split('\n');
    const numericSequence = contentLines[1].split(' ').map(Number);

    const oddCountIsEven = numericSequence.reduce((currentParityState, currentElement) => {
        // If the current element is odd, it flips the parity state of the odd count.
        // If the current element is even, the parity state remains unchanged.
        return (currentElement % 2 !== 0) ? !currentParityState : currentParityState;
    }, true); // Initialize with 'true', representing an even count (0 odd numbers initially).

    console.log(oddCountIsEven ? "YES" : "NO");
}

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
