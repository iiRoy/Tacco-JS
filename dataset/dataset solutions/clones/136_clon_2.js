const fileSystemAccess = require("fs");

let dataRecords = fileSystemAccess.readFileSync("./test.txt", "utf8")
                                  .trim()
                                  .split(/\n/);

const totalScenarios = dataRecords.length;

for (let scenarioIndex = 1; scenarioIndex < totalScenarios; scenarioIndex++) {

    const numericStrings = dataRecords[scenarioIndex]
                                    .trim()
                                    .split(/\s/);

    let pathProgress = [0, 0];

    for (let itemIndex = 0; itemIndex < numericStrings.length; itemIndex++) {

        const currentValue = parseInt(numericStrings[itemIndex], 10);

        const progressDeltas = [
            currentValue - pathProgress[0],
            currentValue - pathProgress[1]
        ];

        if ((progressDeltas[0] < 0) && (progressDeltas[1] < 0)) {
            console.log("NO");
            break;
        }

        if ((progressDeltas[0] <= progressDeltas[1]) && progressDeltas[0] > 0) {
            pathProgress[0] = currentValue;
        } else {
            pathProgress[1] = currentValue;
        }

        if (itemIndex === 9) {
            console.log("YES");
        }
    }
}