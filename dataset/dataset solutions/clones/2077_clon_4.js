const fileSystem = require('fs');

const charCodeA = 'a'.charCodeAt(0);

const generateSequences = (targetLen) => {
    const sequenceStack = [['', -1]];

    while (sequenceStack.length > 0) {
        const [currentFragment, maxIndexUsed] = sequenceStack.pop();

        if (currentFragment.length === targetLen) {
            console.log(currentFragment);
            continue;
        }

        const nextCharUpperLimit = maxIndexUsed + 1;

        for (let charIdx = nextCharUpperLimit; charIdx >= 0; charIdx--) {
            const nextChar = String.fromCharCode(charCodeA + charIdx);
            const newMaxIndex = Math.max(maxIndexUsed, charIdx);
            sequenceStack.push([currentFragment + nextChar, newMaxIndex]);
        }
    }
};

const processInputData = (inputContent) => {
    const sequenceLength = Number(inputContent.split('\n')[0]);
    generateSequences(sequenceLength);
};

processInputData(fileSystem.readFileSync('/dev/stdin', 'utf8'));
