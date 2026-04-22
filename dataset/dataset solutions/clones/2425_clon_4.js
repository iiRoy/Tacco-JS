const fileUtil = require('fs');
const dataSourceIdentifier = '/dev/stdin';
const encodingType = 'utf8';

const processDataEntry = (rawText) => {
    const cleanedText = rawText.trim();
    const elementCount = cleanedText.length;

    return (elementCount % 2 !== 0)
        ? 'No'
        : (Array.from({length: elementCount / 2}, (_, idx) => idx)
            .reduce((acc, currentIdx) => acc && (cleanedText[currentIdx] === cleanedText[currentIdx + elementCount / 2]), true)
            ? 'Yes'
            : '');
};

const acquiredText = fileUtil.readFileSync(dataSourceIdentifier, encodingType);
const finalOutput = processDataEntry(acquiredText);
process.stdout.write(finalOutput + '\n');