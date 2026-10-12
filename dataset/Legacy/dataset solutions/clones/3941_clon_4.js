function Main(input) {
    const inputLines = input.split("\n");

    const elementCount = Number(inputLines[0]);

    const [totalDays, initialCount] = inputLines[1].split(" ").map(Number);

    const activityIntervals = inputLines.slice(2, 2 + elementCount).map(Number);

    const finalTally = activityIntervals.reduce((accumulator, currentInterval) => {
        const additionalCount = 1 + Math.floor((totalDays - 1) / currentInterval);
        return accumulator + additionalCount;
    }, initialCount);

    console.log(finalTally);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
