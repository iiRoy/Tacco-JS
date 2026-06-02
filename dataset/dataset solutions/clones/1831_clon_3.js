const extractRelevantString = (fullInput) => {
    const firstLineSegment = fullInput.split("\n")[0];
    const firstWordSegment = firstLineSegment.split(" ")[0];
    return firstWordSegment;
};

function processInput(rawData) {
    const initialProcessedString = extractRelevantString(rawData);
    let characterSequence = Array.from(initialProcessedString);

    const QUESTION_MARK_CHAR = "?";
    const P_CHAR = "P";
    const D_CHAR = "D";

    for (let currentPosition = 0; currentPosition < characterSequence.length; currentPosition++) {
        if (characterSequence[currentPosition] === QUESTION_MARK_CHAR) {
            if (currentPosition === 0) {
                if (characterSequence.length === 1) {
                    characterSequence = D_CHAR;
                } else {
                    const nextCharacterInSequence = characterSequence[currentPosition + 1];
                    if (nextCharacterInSequence === P_CHAR) {
                        characterSequence[currentPosition] = D_CHAR;
                    } else if (nextCharacterInSequence === D_CHAR) {
                        characterSequence[currentPosition] = P_CHAR;
                    } else if (nextCharacterInSequence === QUESTION_MARK_CHAR) {
                        characterSequence[currentPosition] = P_CHAR;
                    }
                }
            } else {
                const previousCharacterInSequence = characterSequence[currentPosition - 1];
                if (previousCharacterInSequence === P_CHAR) {
                    characterSequence[currentPosition] = D_CHAR;
                } else if (previousCharacterInSequence === D_CHAR) {
                    characterSequence[currentPosition] = P_CHAR;
                }
            }
        }
    }

    const finalOutputString = characterSequence.join("");
    console.log(finalOutputString);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
