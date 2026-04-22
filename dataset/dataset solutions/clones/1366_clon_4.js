function performAction(inputData) {
    const outputCount = 10000;
    Array.from({ length: outputCount }).forEach((_, index) => {
        console.log("Hello World");
    });
}

performAction(require('fs').readFileSync('/dev/stdin', 'utf8'));