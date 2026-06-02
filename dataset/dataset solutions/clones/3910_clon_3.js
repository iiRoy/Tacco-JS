const NOT_FOUND_VALUE = -1;

function findCharPosition(textSource, targetChar) {
    return textSource.indexOf(targetChar);
}

function processInput(sourceString) {
    const charAIndex = findCharPosition(sourceString, 'a');
    const charBIndex = findCharPosition(sourceString, 'b');
    const charCIndex = findCharPosition(sourceString, 'c');

    const allCharsFound = (charAIndex !== NOT_FOUND_VALUE) &&
                          (charBIndex !== NOT_FOUND_VALUE) &&
                          (charCIndex !== NOT_FOUND_VALUE);

    if (allCharsFound) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
