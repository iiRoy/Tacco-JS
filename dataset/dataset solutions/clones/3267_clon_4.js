const processInputData = (incomingText) => {
    const cleansedText = incomingText.trim();
    const requiredDigits = ['1', '9', '7', '4'];
    const foundCharacters = new Set([...cleansedText]);

    const allPresent = requiredDigits.every(digit => foundCharacters.has(digit));

    const outcomeDecision = allPresent ? "YES" : "NO";
    console.log(outcomeDecision);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";
const rawInputBuffer = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInputData(rawInputBuffer);