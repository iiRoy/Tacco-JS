const fileSystemUtility = require('fs');

function processInputData(rawDataString) {
    const contentForProcessing = rawDataString;

    const joinedContentAttempt = contentForProcessing.join('');

    const firstComparisonTarget = 'AAA';
    const secondComparisonTarget = 'BBB';

    const forbiddenPatterns = [firstComparisonTarget, secondComparisonTarget];

    if (forbiddenPatterns.includes(joinedContentAttempt)) {
        console.log('No');
        return;
    }
    console.log('Yes');
}

const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const rawFileContent = fileSystemUtility.readTextFromFile(standardInputPath, textEncoding);

processInputData(rawFileContent);
