'use strict';

const checkWordChain = (phraseSequence) => {
    const wordList = phraseSequence.split('\n').slice(1);

    const evaluationResult = wordList.reduce((accumulator, currentLexeme, index) => {
        if (!accumulator.chainOK) {
            return accumulator;
        }

        if (accumulator.encounteredLexemes.has(currentLexeme)) {
            accumulator.chainOK = false;
            return accumulator;
        }
        accumulator.encounteredLexemes.add(currentLexeme);

        const lexemeInitial = currentLexeme.charAt(0);
        const lexemeFinal = currentLexeme.charAt(currentLexeme.length - 1);

        if (index > 0 && accumulator.previousTerminalChar !== lexemeInitial) {
            accumulator.chainOK = false;
            return accumulator;
        }

        accumulator.previousTerminalChar = lexemeFinal;

        return accumulator;
    }, {
        chainOK: true,
        previousTerminalChar: null,
        encounteredLexemes: new Set()
    });

    console.log(evaluationResult.chainOK ? 'Yes' : 'No');
};

const shouldRunTestCases = false;

if (shouldRunTestCases) {
    checkWordChain('4\nhoge\nenglish\nhoge\nenigma');
    checkWordChain('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');
} else {
    checkWordChain(require('fs').readFileSync('/dev/stdin', 'utf8'));
}