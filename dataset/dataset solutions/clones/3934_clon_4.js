const processInput = (inputNumber) => {
    const figureCount = Number.parseInt(inputNumber, 10);

    if (figureCount < 3 || figureCount > 20000) {
        console.log("しね");
        return;
    }

    const determineElementValue = (elementIndex, totalElements) => {
        if (totalElements === 3) {
            if (elementIndex === 0) return 3;
            if (elementIndex === 1) return 25;
            if (elementIndex === 2) return 2;
        }

        let calculatedValue;
        if (elementIndex === 0) {
            calculatedValue = 3;
        } else if (elementIndex === 1) {
            calculatedValue = 9;
        } else if (elementIndex < 10002) {
            calculatedValue = elementIndex * 3 - 4 - (elementIndex % 2);
        } else if (elementIndex < 15000) {
            calculatedValue = (elementIndex - 10000) * 6 + 3;
        } else {
            calculatedValue = (elementIndex - 14999) * 6;
        }

        if (elementIndex === totalElements - 1 && totalElements !== 3) {
            const isOddOrSmall = (totalElements % 2 === 1 || totalElements < 15000);
            if (isOddOrSmall) {
                calculatedValue = 6;
            }
        }
        return calculatedValue;
    };

    const resultCollection = Array.from(
        { length: figureCount },
        (_, idx) => determineElementValue(idx, figureCount)
    );

    resultCollection.sort((valA, valB) => valA - valB);

    console.log(resultCollection.join(" "));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));