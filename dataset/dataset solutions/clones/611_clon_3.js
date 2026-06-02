const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim();
const lineSegments = processedLines.split("\n");

const numIterations = parseInt(lineSegments.shift(), 10);
const patternChars = lineSegments.shift().split("");

let matchCount = 0;

for (let outerIndex = 0; outerIndex < numIterations; outerIndex++) {
    const currentLine = lineSegments.shift();
    let dotSeparator = "";

    for (let innerIndex = 0; innerIndex < 47; innerIndex++) {
        const generatedPatternString = patternChars.join(dotSeparator);
        const patternNumericValue = Number(generatedPatternString);

        if (patternNumericValue >= 100) {
            break;
        }

        const currentRegex = new RegExp(generatedPatternString);
        const isMatchFound = currentRegex.test(currentLine);

        if (isMatchFound) {
            matchCount++;
            break;
        }
        dotSeparator += ".";
    }
}

console.log(matchCount);
