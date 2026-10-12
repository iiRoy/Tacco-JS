const evaluateComponentValidity = (val) => {
    return (val === 0) ? "2" : ((val >= 1 && val <= 12) ? "1" : "0");
};

const processDateInterpretation = (dateInputString) => {
    const firstTwoChars = dateInputString.substring(0, 2);
    const lastTwoChars = dateInputString.substring(2, 4);

    const numericFirst = Number(firstTwoChars);
    const numericLast = Number(lastTwoChars);

    const firstComponentCode = evaluateComponentValidity(numericFirst);
    const secondComponentCode = evaluateComponentValidity(numericLast);

    const combinedCode = firstComponentCode + secondComponentCode;

    const interpretationMap = new Map([
        ["10", "MMYY"],
        ["11", "AMBIGUOUS"],
        ["01", "YYMM"],
        ["00", "NA"],
        ["02", "NA"],
        ["12", "NA"],
        ["20", "NA"],
        ["21", "NA"],
        ["22", "NA"]
    ]);

    const finalInterpretation = interpretationMap.get(combinedCode);

    console.log(finalInterpretation);
};

processDateInterpretation(require('fs').readFileSync('/dev/stdin', 'utf8'));
