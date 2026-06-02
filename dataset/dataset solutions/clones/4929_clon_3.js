function calculateMismatches(inputLine) {
    const REFERENCE_CODE_STRING = "CODEFESTIVAL2016";
    const targetCharactersArray = Array.from(REFERENCE_CODE_STRING);

    const inputCharactersArray = Array.from(inputLine);
    let mismatchCounter = 0;

    const inputSequenceLength = inputCharactersArray.length;

    for (let charPosition = 0; charPosition < inputSequenceLength; charPosition++) {
        const currentInputCharacter = inputCharactersArray[charPosition];
        const currentTargetCharacter = targetCharactersArray[charPosition];

        const isCharacterDifferent = (currentInputCharacter !== currentTargetCharacter);
        if (isCharacterDifferent) {
            mismatchCounter = mismatchCounter + 1;
        }
    }
    console.log(mismatchCounter);
}

calculateMismatches(require("fs").readFileSync("/dev/stdin", "utf8").trim());
