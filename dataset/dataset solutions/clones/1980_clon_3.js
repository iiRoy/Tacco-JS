function processInputData(sourceString) {
    const targetDigit = '7';
    let foundMatch = false;

    for (let i = 0; i < sourceString.length; i++) {
        const currentCharacter = sourceString[i];
        if (currentCharacter === targetDigit) {
            foundMatch = true;
            break;
        }
    }

    if (foundMatch) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
