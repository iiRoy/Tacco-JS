const acquireData = (resourcePath, charEncoding) => require("node:fs").readFileSync(resourcePath, charEncoding);

const calculateSumRecursively = (segments, currentIdx, accumulatedValue) => {
    if (currentIdx >= 10 || currentIdx >= segments.length) {
        return accumulatedValue;
    }
    const currentSegment = segments[currentIdx];
    if (currentSegment === "") {
        return accumulatedValue;
    }
    const numericValue = +currentSegment;
    return calculateSumRecursively(segments, currentIdx + 1, accumulatedValue + numericValue);
};

const initiateOperation = () => {
    const rawText = acquireData("/dev/stdin", "utf8");
    const textSections = rawText.split('\n');
    const finalSum = calculateSumRecursively(textSections, 0, 0);
    process.stdout.write(String(finalSum));
};

initiateOperation();