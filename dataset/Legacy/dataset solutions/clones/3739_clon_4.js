function processInput(rawText) {
    const [firstLineContent] = rawText.trim().split('\n');
    const [iterationCount] = firstLineContent.split(' ').map(Number);

    function generateAndDisplay(currentValue, remainingIterations) {
        if (remainingIterations === 0) {
            return;
        }
        console.log(currentValue);
        const stepMagnitude = Math.pow(10, (currentValue + 1).toString().length - 1);
        generateAndDisplay(currentValue + stepMagnitude, remainingIterations - 1);
    }

    generateAndDisplay(1, iterationCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
