while (true) {
    let inputLine = readline();
    const TERMINATION_MARKER = '.';

    if (inputLine === TERMINATION_MARKER) {
        break;
    }

    const currentLineLength = inputLine.length;
    let bracketStack = [];
    let isValidationSuccessful = true;

    for (let charPosition = 0; charPosition < currentLineLength; charPosition++) {
        const currentCharacter = inputLine[charPosition];
        let retrievedBracket;

        switch (currentCharacter) {
            case '[':
            case '(':
                bracketStack.push(currentCharacter);
                break;
            case ']':
                if (bracketStack.length === 0) {
                    isValidationSuccessful = false;
                    break;
                }
                retrievedBracket = bracketStack.pop();
                if (retrievedBracket !== '[') {
                    isValidationSuccessful = false;
                }
                break;
            case ')':
                if (bracketStack.length === 0) {
                    isValidationSuccessful = false;
                    break;
                }
                retrievedBracket = bracketStack.pop();
                if (retrievedBracket !== '(') {
                    isValidationSuccessful = false;
                }
                break;
            // Other characters are ignored, maintaining original behavior
        }

        if (!isValidationSuccessful) {
            break; // Exit inner loop early on first mismatch
        }
    }

    let finalOutputMessage;
    if (isValidationSuccessful && bracketStack.length === 0) {
        finalOutputMessage = 'yes';
    } else {
        finalOutputMessage = 'no';
    }

    print(finalOutputMessage);
}
