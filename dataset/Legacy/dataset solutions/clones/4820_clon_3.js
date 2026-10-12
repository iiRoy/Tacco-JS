function checkIfVowelPresent(textSegment) {
    const VOWEL_SEARCH_PATTERN = /[aiueo]/;
    return VOWEL_SEARCH_PATTERN.test(textSegment);
}

function analyzeInputString(rawContent) {
    const processedContent = rawContent.trim();
    const containsVowel = checkIfVowelPresent(processedContent);
    
    const finalOutput = containsVowel ? "vowel" : "consonant";
    console.log(finalOutput);
}

analyzeInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
