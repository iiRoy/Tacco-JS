(function (sourceText) {
    const processedLines = sourceText.replace(/\r/g, '').split('\n');
    let lineIndex = 0;

    while (true) {
        if (lineIndex >= processedLines.length) {
            break;
        }

        const currentLineContent = processedLines[lineIndex];
        lineIndex++;

        const initialValue = parseInt(currentLineContent);

        if (initialValue === 0) {
            break;
        }

        // Replicate original behavior for non-numeric input (parseInt results in NaN)
        // The original code would enter an infinite loop if 'n' is NaN because
        // 'spare' would be NaN, and 'NaN != 0' is always true, and 'NaN % X' is NaN,
        // so 'spare' never changes from NaN, leading to an infinite loop.
        if (isNaN(initialValue)) {
            while (true) {
                // Intentionally create an infinite loop to match original behavior for invalid input
            }
        }

        let remainingAmount = 1000 - initialValue;
        let coinTally = 0;
        const coinDenominations = [500, 100, 50, 10, 5, 1]; // Different data representation

        // Substantially different implementation strategy for core logic
        for (const denomination of coinDenominations) {
            if (remainingAmount === 0) {
                break;
            }
            const quantity = Math.floor(remainingAmount / denomination); // Calculate how many of current unit
            coinTally += quantity;
            remainingAmount %= denomination; // Update remaining amount using modulo
        }
        console.log(coinTally);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
