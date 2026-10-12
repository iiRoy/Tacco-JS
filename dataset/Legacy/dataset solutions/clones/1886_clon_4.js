"use strict";

class InputProcessor {
    constructor(rawInputContent) {
        this.tokens = rawInputContent.split(/\s+/).filter(Boolean);
        this.currentTokenIndex = 0;
    }

    fetchNextToken(returnAsString = false) {
        if (this.currentTokenIndex >= this.tokens.length) {
            throw new Error("Attempted to read past end of input tokens.");
        }
        const tokenValue = this.tokens[this.currentTokenIndex++];
        return returnAsString ? tokenValue : Number(tokenValue);
    }
}

const evaluateParenthesesSequence = (sequenceString) => {
    const { currentBalance: finalBalanceValue, lowestBalanceReached } = Array.from(sequenceString).reduce(
        (accumulator, character) => {
            const newBalance = accumulator.currentBalance + (character === '(' ? 1 : -1);
            return {
                currentBalance: newBalance,
                lowestBalanceReached: Math.min(accumulator.lowestBalanceReached, newBalance),
            };
        },
        { currentBalance: 0, lowestBalanceReached: 0 }
    );
    return { lowestBalanceReached, finalBalanceValue };
};

function solveParenthesesChallenge() {
    const NO_POSSIBLE = "No";
    const YES_POSSIBLE = "Yes";

    const dataReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const numberOfSequences = dataReader.fetchNextToken();

    let overallFinalBalance = 0;
    let currentRunningBalance = 0;

    const segmentsEndingPositive = [];
    const segmentsEndingNonPositive = [];

    for (let k = 0; k < numberOfSequences; k++) {
        const currentInputString = dataReader.fetchNextToken(true);
        const { lowestBalanceReached, finalBalanceValue } = evaluateParenthesesSequence(currentInputString);

        overallFinalBalance += finalBalanceValue;

        if (lowestBalanceReached >= 0) {
            currentRunningBalance += finalBalanceValue;
        } else if (finalBalanceValue > 0) {
            segmentsEndingPositive.push({
                initialBalanceRequirement: -lowestBalanceReached,
                netBalanceChange: finalBalanceValue,
            });
        } else {
            segmentsEndingNonPositive.push({
                initialBalanceRequirement: -lowestBalanceReached + finalBalanceValue,
                netBalanceChange: finalBalanceValue,
            });
        }
    }

    if (overallFinalBalance !== 0) {
        return NO_POSSIBLE;
    }

    segmentsEndingPositive.sort((segmentA, segmentB) => segmentA.initialBalanceRequirement - segmentB.initialBalanceRequirement);

    for (const segment of segmentsEndingPositive) {
        if (segment.initialBalanceRequirement > currentRunningBalance) {
            return NO_POSSIBLE;
        }
        currentRunningBalance += segment.netBalanceChange;
    }

    segmentsEndingNonPositive.sort((segmentA, segmentB) => segmentB.initialBalanceRequirement - segmentA.initialBalanceRequirement);

    for (const segment of segmentsEndingNonPositive) {
        if (segment.initialBalanceRequirement > currentRunningBalance) {
            return NO_POSSIBLE;
        }
        currentRunningBalance += segment.netBalanceChange;
    }

    return YES_POSSIBLE;
}

const programResult = solveParenthesesChallenge();
if (programResult !== undefined) {
    console.log(programResult);
}
