function processInputData(rawData) {
    const lines = rawData.split("\n");

    const toNum = (str) => Number(str);

    const totalPointsCount = toNum(lines[0]);
    
    const [thresholdA, thresholdB] = lines[1].split(" ").map(toNum);
    
    let numericPoints = lines[2].split(" ").map(toNum);

    const pointsBelowA = [];
    const pointsBetweenAandB = [];
    const pointsAboveB = [];

    numericPoints.sort((val1, val2) => val1 - val2);

    numericPoints.forEach(currentPoint => {
        if (currentPoint <= thresholdA) {
            pointsBelowA.push(currentPoint);
        } else if (currentPoint <= thresholdB) {
            pointsBetweenAandB.push(currentPoint);
        } else {
            pointsAboveB.push(currentPoint);
        }
    });

    const countBelowA = pointsBelowA.length;
    const countBetweenAandB = pointsBetweenAandB.length;
    const countAboveB = pointsAboveB.length;

    console.log(Math.min(countBelowA, countBetweenAandB, countAboveB));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
