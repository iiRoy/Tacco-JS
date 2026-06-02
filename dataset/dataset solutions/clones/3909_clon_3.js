function processInputString(sourceContent) {
    const requiredCharacters = ['a', 'b', 'c'];

    const characterExistsInText = (textSegment, charToLocate) => {
        return textSegment.indexOf(charToLocate) !== -1;
    };

    let allRequiredPresent = true;

    for (let i = 0; i < requiredCharacters.length; i++) {
        const currentTargetChar = requiredCharacters[i];
        if (!characterExistsInText(sourceContent, currentTargetChar)) {
            allRequiredPresent = false;
            break;
        }
    }

    if (allRequiredPresent) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
