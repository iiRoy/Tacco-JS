(function executeProgram() {
    "use strict";
    const fileSystem = require("fs");
    const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
    const tokenStream = rawInputData.split(/ |\n/);
    let tokenIndex = 0;

    function readNextToken(asString) {
        const currentToken = tokenStream[tokenIndex++];
        return asString ? currentToken : +currentToken;
    }

    function readTokensArray(count, asString) {
        const startIndex = tokenIndex;
        tokenIndex += count;
        const tokenSlice = tokenStream.slice(startIndex, tokenIndex);
        return asString ? tokenSlice : tokenSlice.map(val => +val);
    }

    function readMatrix(height, width, asString) {
        const resultMatrix = [];
        for (let rowIndex = 0; rowIndex < height; rowIndex++) {
            const startIndex = tokenIndex;
            tokenIndex += width;
            const rowSlice = tokenStream.slice(startIndex, tokenIndex);
            resultMatrix.push(asString ? rowSlice : rowSlice.map(val => +val));
        }
        return resultMatrix;
    }

    function createMultiDimArray(initialValue) {
        const args = arguments;
        let argCount = args.length;
        let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
        while (--argCount) {
            arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
        }
        return eval(arrayCreationString);
    }

    // Helper function to analyze a single parentheses string
    function analyzeParenthesesString(inputString) {
        let currentBalance = 0;
        let minimumBalanceEncountered = 0;
        for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
            if (inputString[charIndex] === "(") {
                currentBalance++;
            } else {
                currentBalance--;
                if (currentBalance < minimumBalanceEncountered) {
                    minimumBalanceEncountered = currentBalance;
                }
            }
        }
        return [minimumBalanceEncountered, currentBalance]; // [min, final]
    }

    function processParenthesesSequences() {
        const NO_RESULT_STR = "No";
        const YES_RESULT_STR = "Yes";

        let numSequences = readNextToken();
        let negativeBalanceSegments = [];
        let totalFinalBalance = 0;
        let currentAvailableBalance = 0;

        for (let sequenceIdx = 0; sequenceIdx < numSequences; sequenceIdx++) {
            let currentSequence = readNextToken(true);
            const [minBalanceInSequence, finalBalanceInSequence] = analyzeParenthesesString(currentSequence);

            totalFinalBalance += finalBalanceInSequence;

            if (finalBalanceInSequence > 0) {
                currentAvailableBalance += finalBalanceInSequence;
            } else {
                // Store the negative of the minimum balance and the final balance
                // This is to sort by the "depth" of the negative balance
                negativeBalanceSegments.push([-minBalanceInSequence, finalBalanceInSequence]);
            }
        }

        if (totalFinalBalance !== 0) {
            return NO_RESULT_STR;
        }

        // Sort segments by the negative of their minimum balance in descending order
        // This prioritizes segments that require a deeper positive balance to be valid
        negativeBalanceSegments.sort((segmentA, segmentB) => segmentB[0] - segmentA[0]);

        for (let segmentIdx = 0; segmentIdx < negativeBalanceSegments.length; segmentIdx++) {
            const [requiredMinBalance, segmentFinalBalance] = negativeBalanceSegments[segmentIdx];

            // If the required minimum balance for this segment exceeds the currently available balance,
            // then it's impossible to form a valid sequence.
            if (requiredMinBalance > currentAvailableBalance) {
                return NO_RESULT_STR;
            }
            // Add the segment's final balance to the available balance.
            // Since segmentFinalBalance is <= 0 for these segments, this effectively reduces currentAvailableBalance.
            currentAvailableBalance += segmentFinalBalance;
        }

        return YES_RESULT_STR;
    }

    const programResult = processParenthesesSequences();
    if (programResult !== undefined) {
        console.log(programResult);
    }
})();
