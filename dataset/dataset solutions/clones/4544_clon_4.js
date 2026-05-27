function processInputSequence(inputContent) {
    const normalizedInput = inputContent.trim();

    const baseAlphabet = "abcdefghijklmnopqrstuvwxyz";
    const characterRegistry = new Set(baseAlphabet.split(""));

    const allInputCharactersAreValid = Array.from(normalizedInput).every(currentSymbol => {
        if (characterRegistry.has(currentSymbol)) {
            characterRegistry.delete(currentSymbol);
            return true;
        }
        return false;
    });

    if (allInputCharactersAreValid) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

processInputSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
