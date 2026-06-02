function processInput(dataString) {
    const trimmedData = dataString.trim();
    const vowelSet = new Set(['a', 'i', 'u', 'e', 'o']);

    const foundVowel = Array.from(trimmedData).some(char => vowelSet.has(char));

    console.log(foundVowel ? "vowel" : "consonant");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
