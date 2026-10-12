function processInput(rawText) {
    const lines = rawText.split("\n");
    const elementCount = Number.parseInt(lines[0], 10);
    const numericValues = lines[1].split(" ").map(Number);

    const totalSum = numericValues.reduce((accumulator, current) => accumulator + current, 0);
    const averageValue = totalSum / elementCount;

    let minimumDifference = Infinity;
    let resultIndex = -1;

    numericValues.forEach((currentValue, currentIndex) => {
        const currentDifference = Math.abs(currentValue - averageValue);
        if (currentDifference < minimumDifference) {
            minimumDifference = currentDifference;
            resultIndex = currentIndex;
        }
    });

    return resultIndex;
}

((inputContent, tempResult, tempType) => {
    if (typeof require !== "undefined") {
        console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        inputContent = inputContent.split("\n").slice(1, -1).join("\n");
        tempResult = (() => {
            try {
                return processInput(inputContent);
            } catch (errorObject) {
                return errorObject.stack || errorObject.message;
            }
        })();
        tempType = typeof tempResult;
        if (tempType !== "string") {
            tempResult = JSON.stringify(tempResult);
        }
        $("<form>").append([
            [10, inputContent],
            0,
            [1, tempType],
            0,
            [10, tempResult]
        ].map(elementDescriptor => $(
            elementDescriptor ? "<textarea>" : "<br>",
            elementDescriptor && {
                rows: elementDescriptor[0],
                cols: 40,
                text: elementDescriptor[1]
            }
        ))).appendTo("body");
    }
})(`
5
2 5 2 5 6
`);
