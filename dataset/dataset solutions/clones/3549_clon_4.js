'use strict'

const evaluateWordSequence = (sourceData) => {
    const lineComponents = sourceData.split('\n');
    const requiredEntryCount = Number(lineComponents[0]);
    const entryPayload = lineComponents.slice(1);

    const distinctEntrySet = new Set(entryPayload);

    if (distinctEntrySet.size !== requiredEntryCount) {
        return 'No';
    }

    const allLinksAreValid = entryPayload.every((currentEntry, idx, fullSequence) => {
        if (idx === 0) {
            return true;
        }
        const priorEntry = fullSequence[idx - 1];
        return priorEntry.at(-1) === currentEntry.at(0);
    });

    return allLinksAreValid ? 'Yes' : 'No';
};

const processExternalInput = (inputPath) => {
    const fileContent = require('fs').readFileSync(inputPath, 'utf8');
    const finalOutcome = evaluateWordSequence(fileContent);
    process.stdout.write(finalOutcome + '\n');
};

processExternalInput('/dev/stdin');