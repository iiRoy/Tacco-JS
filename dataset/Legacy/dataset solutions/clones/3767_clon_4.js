function ComputeResult(sourceData) {
    const numericalComponents = sourceData.match(/-?\d+/g).map(Number);

    const initialBoundary = numericalComponents[0];
    const finalBoundary = numericalComponents[1];

    const differenceMagnitude = finalBoundary - initialBoundary;

    let accumulatedValue = 0;
    for (let currentNumber = 1; currentNumber <= differenceMagnitude; ++currentNumber) {
        accumulatedValue += currentNumber;
    }

    return accumulatedValue - finalBoundary;
}

((payloadString) => {
    const isNodeEnvironment = typeof require !== "undefined";

    if (isNodeEnvironment) {
        const fileSystem = require("fs");
        const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        console.log(ComputeResult(inputContent));
    } else {
        const processedPayload = payloadString.split("\n").slice(1, -1).join("\n");

        let computationResult;
        let resultType;
        try {
            computationResult = ComputeResult(processedPayload);
            resultType = typeof computationResult;
        } catch (errorInstance) {
            computationResult = errorInstance.stack || errorInstance.message;
            resultType = typeof computationResult;
        }

        if (resultType !== "string") {
            computationResult = JSON.stringify(computationResult);
        }

        const inputDisplayData = [10, processedPayload];
        const typeDisplayData = [1, resultType];
        const outputDisplayData = [10, computationResult];

        const elementsToAppend = [
            inputDisplayData,
            null,
            typeDisplayData,
            null,
            outputDisplayData
        ].map(item => {
            if (item) {
                return $("<textarea>", {
                    rows: item[0],
                    cols: 40,
                    text: item[1]
                });
            } else {
                return $("<br>");
            }
        });

        $("<form>").append(elementsToAppend).appendTo("body");
    }
})(`
54 65
`);
