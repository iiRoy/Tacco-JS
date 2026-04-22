function evaluateInput(receivedText) {
    const processedText = receivedText.trim();

    function countOnesRecursively(textSegment, currentTally = 0) {
        if (textSegment.length === 0) {
            return currentTally;
        }
        const firstChar = textSegment.charAt(0);
        const remainingText = textSegment.substring(1);
        const increment = (firstChar === '1') ? 1 : 0;
        return countOnesRecursively(remainingText, currentTally + increment);
    }

    const finalCount = countOnesRecursively(processedText);
    console.log(finalCount);
}

evaluateInput(require("fs").readFileSync("/dev/stdin", "utf8"));