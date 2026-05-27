const getNumericValue = (charString) => parseInt(charString, 10);
const calculateAbsoluteDifference = (valueA, valueB) => Math.abs(valueA - valueB);

function determineMinimumPathCost(inputLine){
    const numericInputValues = inputLine.split(" ").map(getNumericValue);

    const permutationStrings = [
        "012", "021", "102", "120", "201", "210"
    ];

    const allCalculatedPathCosts = permutationStrings.map(currentPermutationString => {
        const currentPermutationIndices = currentPermutationString.split("").map(getNumericValue);

        const costSegmentOne = calculateAbsoluteDifference(
            numericInputValues[currentPermutationIndices[0]],
            numericInputValues[currentPermutationIndices[1]]
        );
        const costSegmentTwo = calculateAbsoluteDifference(
            numericInputValues[currentPermutationIndices[1]],
            numericInputValues[currentPermutationIndices[2]]
        );

        return costSegmentOne + costSegmentTwo;
    });

    return allCalculatedPathCosts.reduce((minimumCostFound, currentPathCost) => Math.min(minimumCostFound, currentPathCost), Infinity);
}

((initialInputString, computedResultValue, resultValueType) => {
    if (typeof require !== "undefined") {
        console.log(determineMinimumPathCost(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        let browserFormattedInput = initialInputString.split("\n");
        browserFormattedInput = browserFormattedInput.slice(1, -1);
        browserFormattedInput = browserFormattedInput.join("\n");

        let finalComputedResult;
        try {
            finalComputedResult = determineMinimumPathCost(browserFormattedInput);
        } catch (executionError) {
            finalComputedResult = executionError.stack || executionError.message;
        }

        resultValueType = typeof finalComputedResult;
        if (resultValueType !== "string") {
            finalComputedResult = JSON.stringify(finalComputedResult);
        }

        const outputStructure = [
            [10, browserFormattedInput],
            0,
            [1, resultValueType],
            0,
            [10, finalComputedResult]
        ];

        const createOutputElement = (itemData) => {
            if (itemData) {
                return $("<textarea>", {
                    rows: itemData[0],
                    cols: 40,
                    text: itemData[1]
                });
            } else {
                return $("<br>");
            }
        };

        const outputForm = $("<form>");
        outputForm.append(outputStructure.map(createOutputElement));
        $("body").append(outputForm);
    }
})(`
1 6 3
`);
