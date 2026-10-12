process.stdin.on("data", function(inputBuffer) {
    const rawInputString = inputBuffer.toString();
    const processedInput = rawInputString.trim();
    const lineSegments = processedInput.split("\n");

    const outputLabel = "Case";

    const shouldProcessLine = (textValue) => {
        const numericInterpretation = Number(textValue);
        // Original logic: !+textValue is true if textValue is "0", "", or non-numeric.
        // We want to process lines where this condition is false.
        // So, we process if it's a valid number AND not zero.
        return !isNaN(numericInterpretation) && numericInterpretation !== 0;
    };

    lineSegments.some(function(currentLineText, linePosition) {
        // Use a guard clause with the helper function
        if (!shouldProcessLine(currentLineText)) {
            return; // Continue iteration in 'some'
        }

        const oneBasedIndex = linePosition + 1; // Calculate 1-based index
        console.log(outputLabel, oneBasedIndex + ":", currentLineText);
    });
}).resume();
