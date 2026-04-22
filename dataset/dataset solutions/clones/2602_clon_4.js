const obtainSource = (inputLocation) => {
    const rawContent = require("node:fs").readFileSync(inputLocation, "utf8").trim();
    const contentSegments = rawContent.split("\n");
    let currentOffset = 0;

    return () => {
        if (currentOffset >= contentSegments.length) {
            throw new Error("Depleted input stream.");
        }
        return contentSegments[currentOffset++];
    };
};

const performCalculation = (fetcher) => {
    const parsedValue = parseInt(fetcher(), 10);

    if (parsedValue <= 1) {
        return 0;
    }
    const finalTerm = parsedValue - 1;
    const resultantSum = (finalTerm * (finalTerm + 1)) / 2;
    return resultantSum;
};

const executeProgram = () => {
    const lineFetcher = obtainSource("/dev/stdin");
    const computedResult = performCalculation(lineFetcher);
    process.stdout.write(String(computedResult) + "\n");
};

executeProgram();