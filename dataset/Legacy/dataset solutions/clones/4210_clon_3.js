function processInput(rawInput) {
    let workingString = rawInput.trim();
    const targetIndices = [0, 4, 6, 8];
    const CHAR_TO_INSERT = 'A';

    const insertCharacter = (baseString, char, position) => {
        return baseString.substring(0, position) + char + baseString.substring(position);
    };

    for (let loopIndex = 0; loopIndex < targetIndices.length; loopIndex++) {
        const charIndex = targetIndices[loopIndex];
        const currentChar = workingString[charIndex];

        console.log(currentChar);

        if (currentChar !== CHAR_TO_INSERT) {
            workingString = insertCharacter(workingString, CHAR_TO_INSERT, charIndex);
        }
    }

    const EXPECTED_FINAL_STRING = "AKIHABARA";
    const isMatch = workingString === EXPECTED_FINAL_STRING;
    console.log(isMatch ? "YES" : "NO");
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
