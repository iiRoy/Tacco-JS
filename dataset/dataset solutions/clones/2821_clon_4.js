const solveProblem = (rawData) => {
    const lineData = rawData.split("\n");
    const firstLineValues = lineData[0].split(" ");
    const segmentCount = Number(firstLineValues[0]);
    const targetValue = Number(firstLineValues[1]);
    const segmentLengths = lineData[1].split(" ").map(Number);

    const accumulatedLengths = segmentLengths.reduce((acc, currentLen) => {
        acc.push(acc[acc.length - 1] + currentLen);
        return acc;
    }, [0]);

    const boundaryPosition = accumulatedLengths.findIndex(val => val >= targetValue);

    const finalResult = boundaryPosition === -1 ? segmentCount + 1 : boundaryPosition + 1;

    console.log(finalResult);
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
