function processInputValues(rawData) {
    const stringNumbers = rawData.split(" ");
    const numericValues = stringNumbers.map(numStr => parseInt(numStr, 10));
    const sortedDescending = numericValues.sort((valA, valB) => valB - valA);

    const firstElementMultiplied = sortedDescending[0] * 10;
    const secondElement = sortedDescending[1];
    const thirdElement = sortedDescending[2];

    return firstElementMultiplied + secondElement + thirdElement;
}

((inputStringForBrowser, resultOfProcessing, typeOfResult) => {
    if (typeof require !== "undefined") {
        const fileSystemModule = require("fs");
        const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        console.log(processInputValues(stdinContent));
    } else {
        const processedBrowserInput = inputStringForBrowser.split("\n").slice(1, -1).join("\n");

        const executeMainLogicSafely = () => {
            try {
                return processInputValues(processedBrowserInput);
            } catch (errorObject) {
                return errorObject.stack || errorObject.message;
            }
        };

        resultOfProcessing = executeMainLogicSafely();
        typeOfResult = typeof resultOfProcessing;

        if (typeOfResult !== "string") {
            resultOfProcessing = JSON.stringify(resultOfProcessing);
        }

        const displayConfigurationItems = [
            [10, processedBrowserInput],
            0,
            [1, typeOfResult],
            0,
            [10, resultOfProcessing]
        ];

        const createDisplayElement = (configItem) => {
            if (configItem) {
                return $("<textarea>", {
                    rows: configItem[0],
                    cols: 40,
                    text: configItem[1]
                });
            } else {
                return $("<br>");
            }
        };

        $("<form>")
            .append(displayConfigurationItems.map(createDisplayElement))
            .appendTo("body");
    }
})(`
5 2 1
`);
