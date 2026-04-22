const fileSystemAccess = require('fs');

const rawInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.split(/\r?\n/).filter(Boolean); // Handles different line endings and removes empty lines

function processSegmentsRecursively(remainingDataSegments, accumulatedResults) {
    if (remainingDataSegments.length === 0) {
        return accumulatedResults;
    }

    const currentBlockSizeIndicator = parseInt(remainingDataSegments[0], 10);
    if (currentBlockSizeIndicator === 0) {
        return accumulatedResults; // Termination condition: encountered '0'
    }

    // Extract mapping dictionary
    const dictionarySectionEndIndex = 1 + currentBlockSizeIndicator;
    const dictionaryEntryLines = remainingDataSegments.slice(1, dictionarySectionEndIndex);
    const translationMap = new Map();
    dictionaryEntryLines.forEach(entryLine => {
        const [sourceToken, targetToken] = entryLine.split(' ');
        translationMap.set(sourceToken, targetToken);
    });

    // Extract phrases for translation
    const phrasesToTranslateCount = parseInt(remainingDataSegments[dictionarySectionEndIndex], 10);
    const phrasesSectionEndIndex = dictionarySectionEndIndex + 1 + phrasesToTranslateCount;
    const phraseLines = remainingDataSegments.slice(dictionarySectionEndIndex + 1, phrasesSectionEndIndex);

    // Perform translation
    const translatedPhraseComponents = phraseLines.map(phrase => {
        return translationMap.has(phrase) ? translationMap.get(phrase) : phrase;
    });
    const assembledOutputPhrase = translatedPhraseComponents.join('');

    // Prepare for the next recursive call
    const subsequentDataSegments = remainingDataSegments.slice(phrasesSectionEndIndex);
    return processSegmentsRecursively(subsequentDataSegments, [...accumulatedResults, assembledOutputPhrase]);
}

const allProcessedOutputs = processSegmentsRecursively(processedInputLines, []);

console.log(allProcessedOutputs.join('\n'));