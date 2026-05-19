process.stdin.on("data", function(incomingBuffer) {
    let sourceText = String(incomingBuffer);
    let resultSegments = [];
    let cleanedText = sourceText.trim();

    for (const currentCharacter of cleanedText) {
        let numericValue = currentCharacter.charCodeAt(0);
        let adjustedValue;

        if (numericValue >= 0x61 && numericValue <= 0x7A) { // 'a' (97) to 'z' (122)
            adjustedValue = numericValue - 0x20; // Convert to uppercase by subtracting 32
        } else if (numericValue >= 0x41 && numericValue <= 0x5A) { // 'A' (65) to 'Z' (90)
            adjustedValue = numericValue + 0x20; // Convert to lowercase by adding 32
        } else {
            adjustedValue = numericValue; // Retain original character code
        }
        resultSegments.push(String.fromCharCode(adjustedValue));
    }
    console.log(resultSegments.join(""));
}).resume();
