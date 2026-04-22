function transformAlphabeticalSequence(inputData) {
    const dataSegments = inputData.match(/([a-z]+)\n(\d+)/);
    if (!dataSegments) throw new Error("Incorrect input structure detected.");

    let initialCharacterSeries = dataSegments[1];
    let availablePowerUnits = parseInt(dataSegments[2], 10);

    let characterCodeArray = Array.from(initialCharacterSeries).map(singleChar => singleChar.charCodeAt(0));

    const computeShiftCostToBaseline = (charValue) => {
        if (charValue === 97) return 0;
        return (97 - charValue + 26) % 26;
    };

    const processCharacterSequenceRecursively = (currentPosition, currentCodesState, remainingEnergy) => {
        if (currentPosition >= currentCodesState.length || remainingEnergy === 0) {
            return currentCodesState;
        }

        let activeCharacterCode = currentCodesState[currentPosition];

        if (activeCharacterCode === 97) { // If 'a', no action needed, proceed to next
            return processCharacterSequenceRecursively(currentPosition + 1, currentCodesState, remainingEnergy);
        }

        let requiredShiftForBaseline = computeShiftCostToBaseline(activeCharacterCode);

        if (requiredShiftForBaseline <= remainingEnergy) {
            let nextCodesState = [...currentCodesState];
            nextCodesState[currentPosition] = 97; // Transform to 'a'
            return processCharacterSequenceRecursively(currentPosition + 1, nextCodesState, remainingEnergy - requiredShiftForBaseline);
        } else {
            // Not enough energy to reach 'a'
            if (currentPosition === currentCodesState.length - 1) { // If it's the final character
                let nextCodesState = [...currentCodesState];
                let netShift = remainingEnergy % 26;
                nextCodesState[currentPosition] = ((activeCharacterCode - 97 + netShift) % 26) + 97;
                return processCharacterSequenceRecursively(currentPosition + 1, nextCodesState, 0); // All energy consumed
            } else {
                // Not the final character and insufficient energy, skip and move on
                return processCharacterSequenceRecursively(currentPosition + 1, currentCodesState, remainingEnergy);
            }
        }
    };

    let finalModifiedCodes = processCharacterSequenceRecursively(0, characterCodeArray, availablePowerUnits);

    console.log(String.fromCharCode(...finalModifiedCodes));
}

transformAlphabeticalSequence(require("node:fs").readFileSync(0, "utf8"));