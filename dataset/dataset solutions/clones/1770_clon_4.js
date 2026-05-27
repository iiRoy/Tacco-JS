function processInputData(rawData) {
    const [creatureCount, totalFootage] = rawData.trim().split(" ").map(Number);

    const minimumFootage = creatureCount * 2;
    const maximumFootage = creatureCount * 4;

    const footageFromMin = totalFootage - minimumFootage;
    const footageToMax = maximumFootage - totalFootage;

    const isWithinRange = (footageFromMin >= 0) && (footageToMax >= 0);

    console.log(isWithinRange ? "Yes" : "No");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
