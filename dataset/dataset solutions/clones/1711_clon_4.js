'use strict';

function ExecuteProgram(rawData) {
    const allLines = rawData.trim().split('\n');

    const totalEventPeriods = parseInt(allLines[0], 10);
    const decayFactors = allLines[1].split(' ').map(Number);
    const distinctEventTypes = decayFactors.length;

    const dailyGainMatrices = Array.from({ length: totalEventPeriods }, (_, lineIdx) =>
        allLines[2 + lineIdx].split(' ').map(Number)
    );

    const mostRecentEventDays = Array(distinctEventTypes).fill(0);

    for (let currentCycle = 1; currentCycle <= totalEventPeriods; ++currentCycle) {
        const typeEvaluations = decayFactors.map((factor, typeId) => {
            const immediateGain = dailyGainMatrices[currentCycle - 1][typeId];
            const cyclesSinceLast = currentCycle - mostRecentEventDays[typeId];
            
            // This calculation derives from simplifying the original logic:
            // The term `sum(C[j] * (i - LastContestDays[j]) * -1 for all j)`
            // is constant for a given day `i` and does not affect which contest `k` is chosen.
            // Thus, we only need to maximize `S[i-1][k] + C[k] * (i - LastContestDays[k])`.
            return immediateGain + (factor * cyclesSinceLast);
        });

        const selectionResult = typeEvaluations.reduce((accumulator, scoreValue, currentTypeId) => {
            if (scoreValue > accumulator.peakScore) {
                return { peakScore: scoreValue, chosenId: currentTypeId };
            }
            return accumulator;
        }, { peakScore: -Infinity, chosenId: -1 });

        const selectedEventTypeIdentifier = selectionResult.chosenId;
        
        mostRecentEventDays[selectedEventTypeIdentifier] = currentCycle;

        console.log(selectedEventTypeIdentifier + 1);
    }
}

(function() {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    ExecuteProgram(inputContent);
})();