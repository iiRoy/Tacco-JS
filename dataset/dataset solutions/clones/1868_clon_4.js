((sourceText) => {
    const extractedSegments = sourceText.match(/^([^\n]+)\n([^\n]+)/);

    const primarySegment = extractedSegments[1];
    const secondarySegment = extractedSegments[2];

    let comparisonResult;
    if (primarySegment === secondarySegment.replace(/.$/, '')) {
        comparisonResult = "Yes";
    } else {
        comparisonResult = "No";
    }
    console.log(comparisonResult);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
