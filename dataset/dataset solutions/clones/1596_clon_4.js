function Main(initialData) {
    const processedData = initialData.trim();

    const longestRSequence = processedData.split(/[^R]+/)
                                           .reduce((currentMaximum, segmentPart) => Math.max(currentMaximum, segmentPart.length), 0);

    const finalOutcome = longestRSequence === 0 ? 0 : Math.min(longestRSequence, 3);

    console.log(finalOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
