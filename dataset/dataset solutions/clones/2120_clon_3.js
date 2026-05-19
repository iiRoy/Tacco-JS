function Main(rawInputData) {
    ans = -1;

    const trimmedInput = rawInputData.trim();
    const processedLines = trimmedInput.split("\n");

    const firstLineContent = processedLines[0];
    const firstLineParts = firstLineContent.split(' ');
    const initialCount = parseInt(firstLineParts[0], 10);

    const featureDataLines = processedLines.slice(1);

    const charResultArray = Array(initialCount).fill('a');

    const parseFeatureLine = (lineString) => {
        const parts = lineString.split(' ');
        return parts.map(part => parseInt(part, 10));
    };

    for (let lineIndex = 0; lineIndex < featureDataLines.length; lineIndex++) {
        const currentFeaturePair = parseFeatureLine(featureDataLines[lineIndex]);
        const targetPosition = currentFeaturePair[0] - 1;
        const assignedValue = currentFeaturePair[1];
        charResultArray[targetPosition] = assignedValue;
    }

    const combinedChars = charResultArray.join("");
    const initialCleanedString = combinedChars.replace(/^a*/, '');
    const finalProcessedString = initialCleanedString.replace(/a/g, '0');

    const numericValueFromProcessedString = parseInt(finalProcessedString, 10);
    const numericRepresentationString = numericValueFromProcessedString.toString();

    if (finalProcessedString === '00') {
        ans = 100;
    } else if (finalProcessedString === '0') {
        ans = 10;
    } else if (finalProcessedString === numericRepresentationString) {
        ans = parseInt(numericRepresentationString, 10);
    }

    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
