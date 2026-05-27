function processInput(rawText) {
    const cleanedText = rawText.trim();
    const hasNineDigit = cleanedText.includes('9');

    if (hasNineDigit) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
