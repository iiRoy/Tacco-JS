const fileSystem = require("fs");

let inputDataRows = fileSystem.readFileSync("./test.txt", "utf8").trim().split(/\n/);

const totalDataEntries = inputDataRows.length;

for (let currentEntryIndex = 1; currentEntryIndex < totalDataEntries; currentEntryIndex++) {
    let numberStrings = inputDataRows[currentEntryIndex].trim().split(/\s/);

    let trackProgress = [0, 0]; // Represents two distinct paths or tracks

    for (let numberPosition = 0; numberPosition < numberStrings.length; numberPosition++) {
        let currentNumericValue = parseInt(numberStrings[numberPosition], 10);

        let progressDifferences = [currentNumericValue - trackProgress[0], currentNumericValue - trackProgress[1]];

        if ((progressDifferences[0] < 0) && (progressDifferences[1] < 0)) {
            console.log("NO");
            break;
        }

        if ((progressDifferences[0] <= progressDifferences[1]) && progressDifferences[0] > 0) {
            trackProgress[0] = currentNumericValue;
        } else {
            trackProgress[1] = currentNumericValue;
        }

        if (numberPosition === 9) {
            console.log("YES");
        }
    }
}
