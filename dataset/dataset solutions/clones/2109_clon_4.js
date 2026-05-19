const processSourceData = (sourceContent) => {
    const firstLine = sourceContent.split('\n')[0];
    const firstSegment = firstLine.split(' ')[0];
    return Number(firstSegment);
};

const deriveOutcome = (initialValue) => {
    return Math.ceil(initialValue / 2);
};

const applicationEntry = (rawInputPayload) => {
    const parsedNumericValue = processSourceData(rawInputPayload);
    const computedResult = deriveOutcome(parsedNumericValue);
    console.log(computedResult);
};

applicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
