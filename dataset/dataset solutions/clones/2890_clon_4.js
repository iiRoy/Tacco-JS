const processDocument = (incomingText) => {
    const firstSegment = incomingText.split('\n')[0];
    let nonOcularCharacterCount = 0;

    for (let currentSymbol of firstSegment) {
        if (currentSymbol !== 'o') {
            nonOcularCharacterCount++;
        }
    }

    switch (nonOcularCharacterCount >= 8) {
        case true:
            console.log("NO");
            break;
        case false:
            console.log("YES");
            break;
    }
};

const rawDataSource = require("fs").readFileSync("/dev/stdin", "utf8");
processDocument(rawDataSource);