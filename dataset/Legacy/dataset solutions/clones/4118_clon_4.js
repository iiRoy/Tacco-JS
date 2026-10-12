function processInput(dataLines) {
    const partsOfFirstLine = dataLines[0].split(" ");
    const firstSegmentLength = Number(partsOfFirstLine[0]);
    const secondSegmentLength = Number(partsOfFirstLine[1]);
    const targetSequence = dataLines[1];

    let validationResult = false;

    const expectedTotalLength = firstSegmentLength + 1 + secondSegmentLength;

    if (targetSequence.length === expectedTotalLength) {
        if (targetSequence.charAt(firstSegmentLength) === '-') {
            let prefixIsValid = true;
            for (let position = 0; position < firstSegmentLength; position++) {
                const currentCharacter = targetSequence.charAt(position);
                if (!(currentCharacter >= '0' && currentCharacter <= '9')) {
                    prefixIsValid = false;
                    break;
                }
            }

            if (prefixIsValid) {
                let suffixIsValid = true;
                for (let position = firstSegmentLength + 1; position < expectedTotalLength; position++) {
                    const currentCharacter = targetSequence.charAt(position);
                    if (!(currentCharacter >= '0' && currentCharacter <= '9')) {
                        suffixIsValid = false;
                        break;
                    }
                }

                if (suffixIsValid) {
                    validationResult = true;
                }
            }
        }
    }

    console.log(validationResult ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
