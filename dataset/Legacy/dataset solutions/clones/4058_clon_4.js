const fs = require('fs');

const obtainInputReader = () => {
    return (promptText) => {
        if (promptText) console.log(promptText);
        return fs.readFileSync('/dev/stdin', 'utf8');
    };
};

const mainExecution = () => {
    const inputReader = obtainInputReader();
    const allInputLines = inputReader().split('\n');
    let currentLinePointer = 0;

    const extractParsedNumbers = () => allInputLines[currentLinePointer++].split(' ').map(Number);

    const [nodeCount, relationCount] = extractParsedNumbers();
    const storedRelations = [];
    for (let k = 0; k < relationCount; k++) {
        const [u, v, d] = extractParsedNumbers();
        storedRelations.push({ u, v, d });
    }

    let consistencyCheckPassed = true;

    for (let i = relationCount - 1; i >= 0; i--) {
        const currentConstraint = storedRelations[i];
        const { u: currentL, v: currentR, d: currentD } = currentConstraint;

        const forwardLinks = new Map();
        const backwardLinks = new Map();

        for (let j = 0; j < i; j++) {
            const existingRel = storedRelations[j];
            if (!forwardLinks.has(existingRel.u)) forwardLinks.set(existingRel.u, []);
            forwardLinks.get(existingRel.u).push({ target: existingRel.v, diff: existingRel.d });

            if (!backwardLinks.has(existingRel.v)) backwardLinks.set(existingRel.v, []);
            backwardLinks.get(existingRel.v).push({ source: existingRel.u, diff: existingRel.d });
        }

        const relationsFromCurrentL = forwardLinks.get(currentL) || [];
        for (const intermediateRel of relationsFromCurrentL) {
            const intermediateNode = intermediateRel.target;
            const intermediateDiff = intermediateRel.diff;

            const pathKtoR = (forwardLinks.get(intermediateNode) || []).filter(link => link.target === currentR);
            for (const finalRel of pathKtoR) {
                if ((intermediateDiff + finalRel.diff - currentD) !== 0) {
                    consistencyCheckPassed = false;
                    break;
                }
            }
            if (!consistencyCheckPassed) break;

            const pathRtoK = (backwardLinks.get(intermediateNode) || []).filter(link => link.source === currentR);
            for (const finalRel of pathRtoK) {
                if ((intermediateDiff + finalRel.diff - currentD) !== 0) {
                    consistencyCheckPassed = false;
                    break;
                }
            }
            if (!consistencyCheckPassed) break;
        }
        if (!consistencyCheckPassed) break;

        const relationsToCurrentL = backwardLinks.get(currentL) || [];
        for (const intermediateRel of relationsToCurrentL) {
            const intermediateNode = intermediateRel.source;
            const intermediateDiff = intermediateRel.diff;

            const pathKtoR = (forwardLinks.get(intermediateNode) || []).filter(link => link.target === currentR);
            for (const finalRel of pathKtoR) {
                if ((intermediateDiff + finalRel.diff - currentD) !== 0) {
                    consistencyCheckPassed = false;
                    break;
                }
            }
            if (!consistencyCheckPassed) break;

            const pathRtoK = (backwardLinks.get(intermediateNode) || []).filter(link => link.source === currentR);
            for (const finalRel of pathRtoK) {
                if ((intermediateDiff + finalRel.diff - currentD) !== 0) {
                    consistencyCheckPassed = false;
                    break;
                }
            }
            if (!consistencyCheckPassed) break;
        }
        if (!consistencyCheckPassed) break;
    }

    console.log(consistencyCheckPassed ? 'Yes' : 'No');
};

mainExecution();
