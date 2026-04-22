const obtainResource = () => {
    const fileSystemModule = require("node:fs");
    const systemInputPath = "/dev/stdin";
    const encodingOptions = { encoding: "utf-8" };
    return fileSystemModule.readFileSync(systemInputPath, encodingOptions).trim();
};

const renderOutput = (contentToDisplay) => {
    process.stdout.write(contentToDisplay + '\n');
};

const processInputData = (incomingTextualContent) => {
    let firstExtractedPart = "";
    let secondExtractedPart = undefined;

    const extractedSegments = [];
    let currentSegmentAccumulator = "";

    for (let characterIndex = 0; characterIndex < incomingTextualContent.length; characterIndex++) {
        const currentCharacter = incomingTextualContent[characterIndex];
        if (currentCharacter === ' ') {
            extractedSegments.push(currentSegmentAccumulator);
            currentSegmentAccumulator = "";
        } else {
            currentSegmentAccumulator += currentCharacter;
        }
    }
    extractedSegments.push(currentSegmentAccumulator);

    firstExtractedPart = extractedSegments[0];
    secondExtractedPart = extractedSegments[1];

    renderOutput(secondExtractedPart + firstExtractedPart);
};

const sourceContent = obtainResource();
processInputData(sourceContent);