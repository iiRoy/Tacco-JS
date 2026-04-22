function processInput (rawData) {
    const segments = rawData.split(' ');
    const primaryCount = parseInt(segments[0], 10);
    const secondaryCount = parseInt(segments[1], 10);

    const groupOneUnits = Math.min(primaryCount, Math.floor(secondaryCount / 2));
    const remainingSecondary = secondaryCount - (groupOneUnits * 2);
    const totalScore = groupOneUnits + Math.floor(remainingSecondary / 4);

    console.log(totalScore);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));