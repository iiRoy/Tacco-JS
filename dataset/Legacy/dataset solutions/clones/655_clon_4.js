const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputReader.on('line', (currentLine) => {
    const lineSegments = currentLine.split(/\s+/);

    if (lineSegments.length >= 2) {
        const firstOperand = Number(lineSegments[0]);
        const secondOperand = Number(lineSegments[1]);

        if (!Number.isNaN(firstOperand) && !Number.isNaN(secondOperand)) {
            console.log(firstOperand + secondOperand);
        }
    }
});
