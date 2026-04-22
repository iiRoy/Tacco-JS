'use strict';

const processInputData = (rawPayload) => {
    const payloadSegments = rawPayload.split('\n');
    const initialPhrase = payloadSegments[0];
    const shiftFactor = Number(payloadSegments[1]);
    return { initialPhrase, shiftFactor };
};

const applyTransformation = (sourceString, initialShiftValue) => {
    const characterSequence = sourceString.split('');
    const referenceA = 'a'.codePointAt(0);
    const referenceZ = 'z'.codePointAt(0);

    const { resultingString } = characterSequence.reduce((accumulatorState, currentSymbol, symbolIndex) => {
        let { currentResult, currentPower } = accumulatorState;
        const symbolOrdinal = currentSymbol.codePointAt(0);

        if (symbolIndex === characterSequence.length - 1) {
            let finalOrdinal = symbolOrdinal + (currentPower % 26);
            if (finalOrdinal > referenceZ) {
                finalOrdinal = referenceA + (finalOrdinal - referenceZ - 1);
            }
            return {
                resultingString: currentResult + String.fromCodePoint(finalOrdinal),
                currentPower: 0
            };
        } else {
            if (currentSymbol === 'a') {
                return {
                    currentResult: currentResult + 'a',
                    currentPower: currentPower
                };
            }

            const conversionCost = referenceZ - symbolOrdinal + 1;

            if (conversionCost <= currentPower) {
                return {
                    currentResult: currentResult + 'a',
                    currentPower: currentPower - conversionCost
                };
            } else {
                return {
                    currentResult: currentResult + currentSymbol,
                    currentPower: currentPower
                };
            }
        }
    }, { currentResult: '', currentPower: initialShiftValue });

    return resultingString;
};

const orchestrateProcess = (inputContent) => {
    const { initialPhrase, shiftFactor } = processInputData(inputContent);
    const finalOutput = applyTransformation(initialPhrase, shiftFactor);
    console.log(finalOutput);
};

orchestrateProcess(require("fs").readFileSync("/dev/stdin", "utf8"));