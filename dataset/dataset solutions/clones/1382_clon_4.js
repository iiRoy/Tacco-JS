const handleInputContent = (sourceText) => {
    const cleanedText = sourceText.trim();
    const initialBreakPoint = cleanedText.indexOf('\n');

    let dataSegments;
    if (initialBreakPoint === -1) {
        // If no newline is found, it implies either an empty input,
        // or an input consisting of a single line (e.g., just the count).
        // In such cases, the original code's `arr.shift()` would result in an empty array,
        // and `arr.sort()[0]` would yield `undefined`.
        dataSegments = [];
    } else {
        // Extract the content starting from after the first newline.
        const subsequentContent = cleanedText.substring(initialBreakPoint + 1);
        // Split this subsequent content into lines.
        // An empty string (e.g., from "3\n") will result in `[""]` after split.
        dataSegments = subsequentContent.split('\n');
    }

    // If `dataSegments` is empty after processing (e.g., input "3" or empty input),
    // the original code would output `undefined`. We must replicate this.
    if (dataSegments.length === 0) {
        console.log(undefined);
        return;
    }

    // Use the `reduce` method to find the lexicographically smallest string.
    // String comparison (`<`) naturally handles lexicographical order.
    const lexicalMinimum = dataSegments.reduce((currentSmallest, currentCandidate) => {
        return (currentCandidate < currentSmallest) ? currentCandidate : currentSmallest;
    });

    console.log(lexicalMinimum);
};

const fetchExternalData = () => require("fs").readFileSync("/dev/stdin", "utf8");

handleInputContent(fetchExternalData());
