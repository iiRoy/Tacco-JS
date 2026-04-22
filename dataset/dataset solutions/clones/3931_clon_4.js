const processInputSeries = (inputSequence) => {
    const seriesLength = inputSequence.length;
    const initialCharacterAscii = 'a'.charCodeAt(0);

    const produceCharacterRange = (startingCode, endingCode) =>
        Array.from({ length: endingCode - startingCode + 1 }, (_, index) => String.fromCharCode(startingCode + index));

    if (seriesLength < 26) {
        const encounteredCharacters = new Set(Array.from(inputSequence));
        const firstAbsentCharacter = produceCharacterRange(initialCharacterAscii, initialCharacterAscii + 25)
            .find(ch => !encounteredCharacters.has(ch));
        return inputSequence + firstAbsentCharacter;
    } else {
        if (inputSequence === "zyxwvutsrqponmlkjihgfedcba") {
            return -1;
        }

        const charactersOnRight = new Set();
        const discoveredResult = Array.from(inputSequence).reduceRight((accumulatorResult, currentCharacter, currentPosition) => {
            if (accumulatorResult !== null) {
                return accumulatorResult;
            }

            if (currentPosition === seriesLength - 1) {
                charactersOnRight.add(currentCharacter);
                return null;
            }

            const currentCharacterCode = currentCharacter.charCodeAt(0);
            const possibleSubstitutions = produceCharacterRange(currentCharacterCode, initialCharacterAscii + 25);

            const chosenSubstitution = possibleSubstitutions.find(ch => charactersOnRight.has(ch));

            if (chosenSubstitution) {
                return inputSequence.substring(0, currentPosition) + chosenSubstitution;
            }

            charactersOnRight.add(currentCharacter);
            return null;
        }, null);

        return discoveredResult === null ? inputSequence : discoveredResult;
    }
};

console.log(processInputSeries(require("fs").readFileSync("/dev/stdin", "utf8").trim()));