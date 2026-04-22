const fileSystemInterface = require("node:fs");

const analyzeTextStream = (sourceLocation) => {
    const streamContent = fileSystemInterface.readFileSync(sourceLocation, "utf8");
    const tokenizedContent = streamContent.split(" ");

    const processedData = tokenizedContent.reduce((summary, currentToken) => {
        const currentTokenCount = (summary.tokenFrequencies.get(currentToken) || 0) + 1;
        summary.tokenFrequencies.set(currentToken, currentTokenCount);

        if (currentTokenCount > summary.highestFrequency) {
            summary.highestFrequency = currentTokenCount;
            summary.dominantToken = currentToken;
        }

        const currentTokenLength = currentToken.length;
        if (currentTokenLength > summary.maximumLength) {
            summary.maximumLength = currentTokenLength;
            summary.lengthiestToken = currentToken;
        }

        return summary;
    }, {
        tokenFrequencies: new Map(),
        highestFrequency: 0,
        dominantToken: 0,
        maximumLength: 0,
        lengthiestToken: 0
    });

    return processedData.dominantToken + " " + processedData.lengthiestToken;
};

const inputPath = "/dev/stdin";
const result = analyzeTextStream(inputPath);
console.log(result);