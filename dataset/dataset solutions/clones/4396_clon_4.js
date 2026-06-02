function processInputAndDecide(rawInputContent) {
    const cleanedContent = rawInputContent.trim();
    const numberTokens = [];
    let currentToken = "";
    for (let i = 0; i < cleanedContent.length; i++) {
        const char = cleanedContent[i];
        if (char === " ") {
            if (currentToken !== "") {
                numberTokens.push(currentToken);
                currentToken = "";
            }
        } else {
            currentToken += char;
        }
    }
    if (currentToken !== "") {
        numberTokens.push(currentToken);
    }

    const numericValues = numberTokens.map(Number);

    const firstVal = numericValues[0];
    const secondVal = numericValues[1];
    const thirdVal = numericValues[2];

    const factorOne = secondVal - thirdVal;
    const factorTwo = secondVal + thirdVal - 2 * firstVal;

    console.log(factorOne * factorTwo < 0 ? "A" : "B");
}

processInputAndDecide(require("fs").readFileSync("/dev/stdin", "utf8"));
