const acquireNumericOperands = (sourceText) => {
    let currentSequence = '';
    const collectedQuantities = [];
    let parsingIndex = 0;

    while (parsingIndex < sourceText.length) {
        const characterUnit = sourceText[parsingIndex];
        if (characterUnit >= '0' && characterUnit <= '9') {
            currentSequence += characterUnit;
        } else {
            if (currentSequence.length > 0) {
                collectedQuantities.push(Number(currentSequence));
                currentSequence = '';
            }
            if (collectedQuantities.length === 2) break;
        }
        parsingIndex++;
    }
    if (currentSequence.length > 0 && collectedQuantities.length < 2) {
        collectedQuantities.push(Number(currentSequence));
    }
    return collectedQuantities;
};

const determineSecurityStatus = (primaryValue, secondaryValue) => {
    const statusMapping = {
        true: 'unsafe',
        false: 'safe'
    };
    return statusMapping[primaryValue <= secondaryValue];
};

(function() {
    const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
    const [firstTerm, secondTerm] = acquireNumericOperands(dataStream);
    const finalOutcome = determineSecurityStatus(firstTerm, secondTerm);
    process.stdout.write(finalOutcome + '\n');
})();