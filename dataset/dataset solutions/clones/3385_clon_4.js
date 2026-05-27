const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputTokens = rawInputContent.trim().split(/\s+/g);

function* tokenParser(sourceTokens) {
    let currentIdx = 0;
    while (currentIdx < sourceTokens.length) {
        const currentToken = sourceTokens[currentIdx];
        currentIdx++;
        yield parseInt(currentToken, 10);
    }
}

const numericStream = tokenParser(inputTokens);

const countOfNumbers = numericStream.next().value;

const valuesToExamine = Array.from({ length: countOfNumbers }, () => numericStream.next().value);

const anyOddFound = valuesToExamine.some(numVal => numVal % 2 === 1);

if (anyOddFound) {
    console.log("first");
} else {
    console.log("second");
}
