"use strict";

const DELICIOUS_OUTCOME = 'delicious';
const DANGEROUS_OUTCOME = 'dangerous';
const SAFE_OUTCOME = 'safe';
const EMPTY_OUTCOME = '';

const calculateDecision = (valA, valB, valC) => {
    const firstConditionCheck = valB;
    const secondConditionCheck = valC;

    if (firstConditionCheck >= secondConditionCheck) {
        return DELICIOUS_OUTCOME;
    }

    const adjustedValA = valA + 1;
    const differenceValCValB = valC - valB;

    if (adjustedValA < differenceValCValB) {
        return DANGEROUS_OUTCOME;
    } else if (adjustedValA > differenceValCValB) {
        return SAFE_OUTCOME;
    }
    
    return EMPTY_OUTCOME;
};

const processInputData = (rawInputContent) => {
    const cleanedInput = rawInputContent.trim();
    const stringSegments = cleanedInput.split(' ');
    
    const numericalValues = stringSegments.map(segment => parseInt(segment, 10));

    const finalDecision = calculateDecision(
        numericalValues[0],
        numericalValues[1],
        numericalValues[2]
    );
    
    console.log(finalDecision);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
