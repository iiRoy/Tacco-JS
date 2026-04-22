function evaluateDataStream(sourceContent) {
    const contentUnits = sourceContent.trim().split('\n');
    const targetValues = contentUnits[1].split(' ').map(Number);

    const flaggedIssue = targetValues.some(item => {
        if (item % 2 === 0) {
            if (item % 3 !== 0 && item % 5 !== 0) {
                return true;
            }
        }
        return false;
    });

    const outcomeMessage = flaggedIssue ? 'DENIED' : 'APPROVED';
    console.log(outcomeMessage);
}

evaluateDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));