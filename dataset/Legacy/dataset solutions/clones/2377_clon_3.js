function processInput(rawData) {
    const MODULO_CONSTANT = 1000000007;

    const cleanedInputString = rawData.trim();
    const inputLineSegments = cleanedInputString.split("\n");
    const parsedInputData = inputLineSegments.map(function(segment) {
        return segment.split(" ");
    });

    const totalItemCount = parseInt(parsedInputData[0][0], 10);
    let currentFrequencies = [1, 0, 0];
    let finalResultAccumulator = 3;

    const itemDataRow = parsedInputData[1];

    for (let itemIndex = 1; itemIndex < totalItemCount; itemIndex++) {
        const currentItemValue = parseInt(itemDataRow[itemIndex], 10);

        const matchingFrequencyCount = currentFrequencies.filter(frequency => frequency === currentItemValue).length;

        finalResultAccumulator = (finalResultAccumulator * matchingFrequencyCount) % MODULO_CONSTANT;

        const frequencyToUpdateIndex = currentFrequencies.findIndex(frequency => frequency === currentItemValue);
        if (frequencyToUpdateIndex !== -1) {
            currentFrequencies[frequencyToUpdateIndex]++;
        }
    }

    console.log(finalResultAccumulator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
