function processInputData(rawData) {
    const lines = rawData.split("\n");
    const iterationLimit = Number(lines[0]);

    let currentDigitValue = 1;
    let currentDigitCount = 1;

    const MAX_SINGLE_DIGIT_VALUE = 9;
    const NINE_CHAR_FOR_PADDING = "9";

    const buildPaddedNumberString = (startValue, paddingNinesCount) => {
        let resultString = String(startValue);
        for (let padIndex = 0; padIndex < paddingNinesCount; padIndex++) {
            resultString += NINE_CHAR_FOR_PADDING;
        }
        return resultString;
    };

    for (let loopIndex = 0; loopIndex < iterationLimit; loopIndex++) {
        let outputLineContent;

        const numberOfNinesToAppend = currentDigitCount > 1 ? currentDigitCount - 1 : 0;

        outputLineContent = buildPaddedNumberString(currentDigitValue, numberOfNinesToAppend);

        console.log('%s', outputLineContent);

        currentDigitValue++;
        if (currentDigitValue > MAX_SINGLE_DIGIT_VALUE) {
            currentDigitValue = 1;
            currentDigitCount++;
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
