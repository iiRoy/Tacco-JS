const convertToNumericValue = (textualInput) => Number(textualInput);

const processStringArrayIntoNumbers = (stringElements) => stringElements.reduce((accumulator, currentElement) => {
    accumulator.push(convertToNumericValue(currentElement));
    return accumulator;
}, []);

const determineAndDisplaySymbol = (fullInputContent) => {
    const contentSegments = fullInputContent.split(' ');
    const [firstValue, secondValue] = processStringArrayIntoNumbers(contentSegments);

    const operationRuleset = [
        { conditionMet: (val1, val2) => val1 + val2 === 15, outcomeSymbol: '+' },
        { conditionMet: (val1, val2) => val1 * val2 === 15, outcomeSymbol: '*' }
    ];

    let finalSymbol = 'x';
    for (const ruleEntry of operationRuleset) {
        if (ruleEntry.conditionMet(firstValue, secondValue)) {
            finalSymbol = ruleEntry.outcomeSymbol;
            break;
        }
    }

    console.log(finalSymbol);
};

determineAndDisplaySymbol(require("fs").readFileSync("/dev/stdin", "utf8"));
