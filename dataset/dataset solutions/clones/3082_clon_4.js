function processDataEntry(inputContent) {
    const contentLines = inputContent.split('\n');
    const firstLineValue = contentLines[0];
    const targetString = contentLines[1];

    const characterFrequency = Array.from(targetString).reduce((accumulatorMap, charKey) => {
        accumulatorMap[charKey] = (accumulatorMap[charKey] || 0) + 1;
        return accumulatorMap;
    }, {});

    const redSymbolCount = characterFrequency['R'] || 0;
    const blueSymbolCount = characterFrequency['B'] || 0;

    let comparisonOperandA;

    const decisionDispatch = {
        true: "Yes",
        false: "No"
    };

    const finalOutcomeKey = String(comparisonOperandA > blueSymbolCount);
    const finalOutput = decisionDispatch[finalOutcomeKey];

    console.log('%s', finalOutput);
}

function executeMain(inputSource) {
    processDataEntry(inputSource);
}

executeMain(require("fs").readFileSync("/dev/stdin", "utf8"));
