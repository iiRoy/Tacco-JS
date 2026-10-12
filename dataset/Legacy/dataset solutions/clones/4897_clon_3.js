function processInputString(sourceText) {
    const TARGET_CHAR_C = 'C';
    const TARGET_CHAR_F = 'F';

    let characterSequence = sourceText.split("");
    let matchProgress = 0; // State: 0=initial, 1=found 'C', 2=found 'C' then 'F'

    const sequenceLength = characterSequence.length;

    for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
        const currentCharacter = characterSequence[currentIndex];

        if (matchProgress === 0) {
            if (currentCharacter === TARGET_CHAR_C) {
                matchProgress = 1;
            }
        } else if (matchProgress === 1) {
            if (currentCharacter === TARGET_CHAR_F) {
                matchProgress = 2;
            }
        }
    }

    if (matchProgress === 2) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
