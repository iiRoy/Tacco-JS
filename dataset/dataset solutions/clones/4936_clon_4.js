const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputSegments = acquiredData.trim().split('\n');
const initialConfig = inputSegments[0].split(' ').map(Number);
const participantSequence = inputSegments[1].split('');

const [totalParticipants, typeALimit, typeBLimit] = initialConfig;

const finalState = participantSequence.reduce((currentStatus, participantType) => {
    let { acceptedCount, typeBAcceptedCount, outcomes } = currentStatus;
    let currentOutcome = "No";
    
    const totalAllowed = typeALimit + typeBLimit;

    const decisionMaker = {
        'a': () => {
            if (acceptedCount < totalAllowed) {
                currentOutcome = "Yes";
                acceptedCount++;
            }
        },
        'b': () => {
            if (acceptedCount < totalAllowed && typeBAcceptedCount < typeBLimit) {
                currentOutcome = "Yes";
                acceptedCount++;
                typeBAcceptedCount++;
            }
        },
        'c': () => { /* always "No" */ }
    };

    (decisionMaker[participantType] || (() => {}))();

    outcomes.push(currentOutcome);

    return {
        acceptedCount,
        typeBAcceptedCount,
        outcomes
    };
}, { acceptedCount: 0, typeBAcceptedCount: 0, outcomes: [] });

console.log(finalState.outcomes.join('\n'));