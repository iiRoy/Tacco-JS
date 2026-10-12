function processInputData(rawData) {
    const [costValue, damageThreshold] = rawData.split("\n").map(Number);

    const decisionMap = {
        true: "YES",
        false: "NO"
    };

    const remainder = costValue % 500;
    const conditionMet = remainder <= damageThreshold;

    console.log(decisionMap[conditionMet]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
