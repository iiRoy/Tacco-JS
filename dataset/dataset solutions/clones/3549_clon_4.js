'use strict';

const processInputData = (sourceText) => {
    const dataLines = sourceText.split('\n');
    const requiredUniqueCount = Number(dataLines[0]);
    const wordSequence = dataLines.slice(1);

    const uniqueEntries = new Set(wordSequence);
    if (uniqueEntries.size !== requiredUniqueCount) {
        return 'No';
    }

    const chainIntegrity = wordSequence.every((currentElement, currentIndex, fullList) => {
        if (currentIndex === 0) {
            return true;
        }
        const priorElement = fullList[currentIndex - 1];
        return priorElement.charAt(priorElement.length - 1) === currentElement.charAt(0);
    });

    if (!chainIntegrity) {
        return 'No';
    }

    return 'Yes';
};

const executeProgram = (inputSource) => {
    console.log(processInputData(inputSource));
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
