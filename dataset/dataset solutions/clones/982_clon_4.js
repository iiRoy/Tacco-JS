const processingOptions = {
    resourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const fileSystemModule = require('fs');
const rawDataBuffer = fileSystemModule.readFileSync(processingOptions.resourcePath);
const contentSegments = rawDataBuffer.toString().split(processingOptions.lineSeparator);

const primaryTextContainer = contentSegments[0];
const queryCountValue = Number(contentSegments[1]);
const patternList = contentSegments.slice(2, 2 + queryCountValue);

function sanitizeForRegex(rawInputText) {
    return rawInputText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkPresenceIndicator(mainContent, targetFragment) {
    const safePatternString = sanitizeForRegex(targetFragment);
    const searchExpression = new RegExp(safePatternString);
    return searchExpression.test(mainContent) ? 1 : 0;
}

patternList.forEach(currentPattern => {
    console.log(checkPresenceIndicator(primaryTextContainer, currentPattern));
});