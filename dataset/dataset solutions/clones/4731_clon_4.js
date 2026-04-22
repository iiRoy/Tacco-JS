'use strict'
const performEvaluation = rawInputContent => {
    const digitSequence = rawInputContent.match(/^\s*(\d+)/);
    const numericalValue = +digitSequence[1];
    const competitionDesignations = ['ABC', 'ARC'];
    const selectionIndex = +(numericalValue >= 1200);
    process.stdout.write(competitionDesignations[selectionIndex] + '\n');
};
performEvaluation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));