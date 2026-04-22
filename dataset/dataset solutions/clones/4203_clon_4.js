function AcquireResult(inputData) {
    const constructStringRecursively = (level) => {
        if (level === 0) return 'S';
        if (level === 1) return 'E' + constructStringRecursively(0);
        if (level === 2) return 'Y' + constructStringRecursively(1);
        return '';
    };

    const computedOutcome = constructStringRecursively(2);
    process.stdout.write(computedOutcome + '\n');
}

AcquireResult(require("fs").readFileSync("/dev/stdin", "utf8").trim());