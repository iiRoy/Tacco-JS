function processInput(limitValStr) {
    const parsedLimit = parseInt(limitValStr.split("\n")[0], 10);

    const allowedDigits = ["0", "3", "5", "7"];

    let validCount = 0;

    const checkDigitPresence = (digitArray, targetDigit) => digitArray.includes(targetDigit);
    const checkAllRequiredDigits = (digitArray) =>
        checkDigitPresence(digitArray, "3") &&
        checkDigitPresence(digitArray, "5") &&
        checkDigitPresence(digitArray, "7");

    for (const d1 of allowedDigits) {
        for (const d2 of allowedDigits) {
            for (const d3 of allowedDigits) {
                for (const d4 of allowedDigits) {
                    for (const d5 of allowedDigits) {
                        for (const d6 of allowedDigits) {
                            for (const d7 of allowedDigits) {
                                for (const d8 of allowedDigits) {
                                    for (const d9 of allowedDigits) {
                                        const rawDigitString = d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9;

                                        const numericValue = parseInt(rawDigitString, 10);
                                        const processedNumString = String(numericValue);
                                        const currentDigitsArray = processedNumString.split("");

                                        if (currentDigitsArray.length < 3) {
                                            continue;
                                        }

                                        if (checkDigitPresence(currentDigitsArray, "0")) {
                                            continue;
                                        }

                                        if (checkAllRequiredDigits(currentDigitsArray)) {
                                            const finalNumber = parseInt(processedNumString, 10);

                                            if (finalNumber > parsedLimit) {
                                                return validCount;
                                            }
                                            validCount++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return validCount;
}

((initialInputString, logFunction, fsModule) => {
    if (typeof fsModule !== "undefined") {
        logFunction(processInput(fsModule.readFileSync("/dev/stdin", "utf8")));
    } else {
        let browserProcessedInput = initialInputString.split("\n").slice(1, -1).join("\n");

        let computationResult;
        let resultDataType;

        try {
            computationResult = processInput(browserProcessedInput);
        } catch (errorObject) {
            computationResult = errorObject.stack || errorObject.message;
        }

        resultDataType = typeof computationResult;

        if (resultDataType !== "string") {
            computationResult = JSON.stringify(computationResult);
        }

        $("<form>")
            .append(
                [
                    [10, browserProcessedInput],
                    0,
                    [1, resultDataType],
                    0,
                    [10, computationResult],
                ].map((item) =>
                    $(
                        item ? "<textarea>" : "<br>",
                        item && { rows: item[0], cols: 40, text: item[1] }
                    )
                )
            )
            .appendTo("body");
    }
})(
    `
999999999
`,
    console.log,
    typeof require !== "undefined" ? require("fs") : undefined
);
