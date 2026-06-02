process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(inputBuffer) {
    const digitPairMatcher = /(\d+)\s+(\d+)/;

    const processedResults = inputBuffer.split("\n").reduce((accumulator, currentLine) => {
        const matchAttempt = digitPairMatcher.exec(currentLine);

        if (matchAttempt && matchAttempt.length === 3) {
            const firstOperand = Number(matchAttempt[1]);
            const secondOperand = Number(matchAttempt[2]);

            if (!Number.isNaN(firstOperand) && !Number.isNaN(secondOperand)) {
                accumulator.push((firstOperand + secondOperand).toString());
            }
        }
        return accumulator;
    }, []);

    if (processedResults.length > 0) {
        process.stdout.write(processedResults.join("\n") + "\n");
    }
});
