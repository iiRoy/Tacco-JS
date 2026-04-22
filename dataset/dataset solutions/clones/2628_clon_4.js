const obtainExternalResource = (moduleName) => {
    const moduleLoader = process.mainModule['require'];
    return moduleLoader(moduleName);
};

const fileSystem = obtainExternalResource("fs");
const retrieveFileContent = fileSystem['readFileSync'];
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const entireContent = retrieveFileContent(standardInputPath, textEncoding);

const processDataStream = (contentPayload) => {
    const lineBreakPosition = contentPayload.indexOf("\n");
    const primarySegment = contentPayload.slice(0, lineBreakPosition);
    const secondarySegment = contentPayload.slice(lineBreakPosition + 1);

    const numericalPattern = /^\s*(\d+)\s*$/;
    const primaryMatchResult = primarySegment.match(numericalPattern);

    let comparisonValue;
    if (primaryMatchResult) {
        comparisonValue = Number(primaryMatchResult[1]);
    } else {
        comparisonValue = NaN;
    }

    const spacePosition = secondarySegment.indexOf(" ");
    let computedResult;

    if (comparisonValue >= 3200) {
        computedResult = (spacePosition !== -1)
            ? secondarySegment.substring(0, spacePosition)
            : secondarySegment;
    } else {
        computedResult = "r";
    }

    process.stdout.write(computedResult + "\n");
};

processDataStream(entireContent);