function computeSequence(textualData) {
    const lines = textualData.split("\n");
    const iterationCount = parseInt(lines[0], 10);

    const processStep = (stepsRemaining, currentLeading, totalDigits) => {
        if (stepsRemaining <= 0) {
            return;
        }

        let resultNumericValue;
        if (totalDigits === 1) {
            resultNumericValue = currentLeading;
        } else {
            const powerOfTen = Math.pow(10, totalDigits - 1);
            resultNumericValue = (currentLeading * powerOfTen) + (powerOfTen - 1);
        }

        console.log(String(resultNumericValue));

        let nextLeading = currentLeading + 1;
        let nextTotalDigits = totalDigits;

        if (nextLeading > 9) {
            nextLeading = 1;
            nextTotalDigits++;
        }

        processStep(stepsRemaining - 1, nextLeading, nextTotalDigits);
    };

    processStep(iterationCount, 1, 1);
}

computeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));