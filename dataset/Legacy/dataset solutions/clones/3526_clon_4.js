function Main(input) {
    const inputLines = input.split("\n");

    const [countN, countM, initialXValue, initialYValue] = inputLines[0].split(" ").map(Number);

    const xCoordinates = inputLines[1].split(" ").map(Number);

    const yCoordinates = inputLines[2].split(" ").map(Number);

    const highestXValue = xCoordinates.reduce((currentMax, coordinate) => Math.max(currentMax, coordinate), initialXValue);

    const lowestYValue = yCoordinates.reduce((currentMin, coordinate) => Math.min(currentMin, coordinate), initialYValue);

    const finalResult = (initialXValue >= initialYValue || lowestYValue >= highestXValue) ? 'War' : 'No War';

    console.log(finalResult);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
