'use strict';

const processSequence = (dataString) => {
    const sequenceItems = dataString.split('\n').slice(1);

    const initialAccumulator = {
        validityStatus: true,
        encounteredTerms: new Set(),
        previousTerminalChar: null
    };

    const finalState = sequenceItems.reduce((acc, currentTerm) => {
        if (!acc.validityStatus) {
            return acc;
        }

        let currentValidity = acc.validityStatus;

        if (acc.encounteredTerms.has(currentTerm)) {
            currentValidity = false;
        }

        const termInitial = currentTerm[0];
        const termTerminal = currentTerm.at(-1);

        if (acc.previousTerminalChar !== null && acc.previousTerminalChar !== termInitial) {
            currentValidity = false;
        }

        const updatedEncounteredTerms = new Set([...acc.encounteredTerms, currentTerm]);

        return {
            validityStatus: currentValidity,
            encounteredTerms: updatedEncounteredTerms,
            previousTerminalChar: termTerminal
        };
    }, initialAccumulator);

    console.log(finalState.validityStatus ? 'Yes' : 'No');
};

const runTests = false;

if (runTests) {
    processSequence('4\nhoge\nenglish\nhoge\nenigma');
    processSequence('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');
} else {
    processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
