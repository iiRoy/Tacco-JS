const fileSystem = require('fs');

const processInputString = (inputLine) => {
    const charSequence = inputLine.split('');
    const totalLength = charSequence.length;
    const targetTally = totalLength / 2;

    const intermediateStates = charSequence.reduce((accumulator, currentCharacter) => {
        const previousState = accumulator.length > 0 ? accumulator[accumulator.length - 1] : {
            tallyOfT: 0,
            tallyOfOther: 0,
            matchedUnits: 0,
            completionFlag: false
        };

        if (previousState.completionFlag) {
            accumulator.push(previousState);
            return accumulator;
        }

        let currentTallyOfT = previousState.tallyOfT;
        let currentTallyOfOther = previousState.tallyOfOther;
        let currentMatchedUnits = previousState.matchedUnits;

        if (currentCharacter === 'T') {
            currentTallyOfT++;
            if (currentMatchedUnits < currentTallyOfOther) {
                currentMatchedUnits++;
            }
        } else {
            currentTallyOfOther++;
        }

        const completionFlag = currentTallyOfT === targetTally;

        accumulator.push({
            tallyOfT: currentTallyOfT,
            tallyOfOther: currentTallyOfOther,
            matchedUnits: currentMatchedUnits,
            completionFlag: completionFlag
        });
        return accumulator;
    }, []);

    const relevantState = intermediateStates.find(state => state.tallyOfT === targetTally) ||
                          intermediateStates[intermediateStates.length - 1];

    const finalOutcome = totalLength - 2 * relevantState.matchedUnits;
    console.log(finalOutcome);
};

const rawInput = fileSystem.readFileSync('/dev/stdin', 'UTF-8');
const firstLine = rawInput.split('\n')[0];

processInputString(firstLine);
