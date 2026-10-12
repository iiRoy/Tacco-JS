function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const totalElements = parseInt(inputLines[0]);
    const elementValues = inputLines[1].split(" ").map(Number);

    let minimumCount = 0;
    const initialMinSentinel = totalElements + 10;
    let currentMinimum = initialMinSentinel;

    for (let idx = 0; idx < totalElements; ++idx) {
        const currentElement = elementValues[idx];
        if (currentElement <= currentMinimum) {
            currentMinimum = currentElement;
            minimumCount++;
        }
    }
    console.log(minimumCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
