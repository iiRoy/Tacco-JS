function processInput(inputString) {
    const inputLines = inputString.split("\n");
    const [totalCount, windowSize] = inputLines[0].split(" ").map(Number);
    const dataSequence = inputLines[1].split(" ").map(Number);

    const primeDivisor = 10**9 + 7;

    const initialWindowElements = dataSequence.slice(0, windowSize);
    let currentWindowResult = initialWindowElements.reduce((accumulator, element) => {
        return (accumulator * element) % primeDivisor;
    }, 1);

    function evaluateWindowsRecursively(currentWindowStartIdx, previousWindowComputedValue) {
        if (currentWindowStartIdx >= totalCount - windowSize + 1) {
            return;
        }

        const elementExitingWindow = dataSequence[currentWindowStartIdx - 1];
        const elementEnteringWindow = dataSequence[currentWindowStartIdx + windowSize - 1];

        const subsequentWindowComputedValue = (previousWindowComputedValue * elementEnteringWindow) / elementExitingWindow;

        if (subsequentWindowComputedValue > previousWindowComputedValue) {
            console.log("Yes");
        } else {
            console.log("No");
        }

        const nextPreviousWindowComputedValue = subsequentWindowComputedValue % primeDivisor;
        evaluateWindowsRecursively(currentWindowStartIdx + 1, nextPreviousWindowComputedValue);
    }

    evaluateWindowsRecursively(1, currentWindowResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
