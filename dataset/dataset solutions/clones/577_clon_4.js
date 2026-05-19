(function (sourceData) {
    const escapeRegExp = (str) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const inputLines = sourceData.replace(/\r/g, '').split("\n");
    let lineCursor = 0;
    const outputValues = [];

    while (true) {
        const firstInput = inputLines[lineCursor++];
        if (firstInput === '') {
            break;
        }
        const secondInput = inputLines[lineCursor++];

        let shorterText, longerText;
        if (firstInput.length < secondInput.length) {
            shorterText = firstInput;
            longerText = secondInput;
        } else {
            shorterText = secondInput;
            longerText = firstInput;
        }

        let currentHighestLength = 0;

        for (let startPos = 0; startPos < shorterText.length; startPos++) {
            for (let endPos = startPos + 1; endPos <= shorterText.length; endPos++) {
                const potentialSubstring = shorterText.substring(startPos, endPos);
                
                const searchPattern = new RegExp(escapeRegExp(potentialSubstring));
                const matchResult = searchPattern.exec(longerText);
                
                if (matchResult && matchResult.index > 0) {
                    currentHighestLength = Math.max(currentHighestLength, potentialSubstring.length);
                }
            }
        }
        outputValues.push(currentHighestLength);
    }

    outputValues.forEach(result => console.log(result));

})(require("fs").readFileSync("/dev/stdin", "utf8"));
