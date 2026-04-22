function analyzeInputValues(rawInputContent) {
    const numericPattern = /-?\d+/g;
    const extractedStrings = rawInputContent.match(numericPattern);

    const firstQuantity = +extractedStrings[0];
    const secondQuantity = +extractedStrings[1];

    const comparisonOutcome = firstQuantity > secondQuantity;

    const resultMapping = {
        true: 'safe',
        false: 'unsafe'
    };

    console.log(resultMapping[comparisonOutcome]);
}

analyzeInputValues(require("fs").readFileSync("/dev/stdin", "utf8"));