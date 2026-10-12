function* tokenGenerator(sourceText) {
    const allTokens = sourceText.match(/\S+/g) || [];
    let currentTokenIndex = 0;
    while (currentTokenIndex < allTokens.length) {
        yield allTokens[currentTokenIndex++];
    }
}

function processInputData(rawData) {
    const tokenStream = tokenGenerator(rawData);

    let nextItem;
    while ((nextItem = tokenStream.next().value) !== undefined) {
        if (nextItem === "-") {
            break;
        }

        let activeString = nextItem;
        const rotationCount = parseInt(tokenStream.next().value, 10);

        Array.from({ length: rotationCount }).forEach(() => {
            const shiftAmount = parseInt(tokenStream.next().value, 10);
            const charArray = Array.from(activeString);
            charArray.push(...charArray.splice(0, shiftAmount));
            activeString = charArray.join('');
        });

        console.log(activeString);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
