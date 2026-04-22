const processExternalContent = (incomingText) => {
    const decisionMap = new Map([
        [true, "Four"],
        [false, "Three"]
    ]);

    // Utilize a regular expression to extract the second line of text
    // This avoids direct array indexing after splitting by newline, offering a different approach
    const linePattern = /^[^\n]*\n([^\n]*)/m;
    const lineMatch = incomingText.match(linePattern);
    const targetLine = (lineMatch && lineMatch[1]) ? lineMatch[1] : "";

    // Determine if the target line contains the specific indicator
    // Using Array.prototype.some() provides a functional and declarative way,
    // distinct from an imperative loop with a boolean flag.
    const indicatorPresent = targetLine.split(' ').some(segment => segment === 'Y');

    // Return the corresponding string based on the lookup map
    return decisionMap.get(indicatorPresent);
};

// Read the input data from standard input, ensuring it's trimmed of whitespace
const sourceData = require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

// Output the result of processing the input data
console.log(processExternalContent(sourceData));