function processInputData(sourceText) {
    const characterSequence = sourceText.split("");
    
    const uniqueInitialCharacters = new Set(characterSequence.slice(0, 3));

    if (uniqueInitialCharacters.size === 1) {
        console.log("No");
    } else {
        console.log("Yes");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
