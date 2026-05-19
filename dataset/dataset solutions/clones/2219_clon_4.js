function processData(rawData) {
    const contentLines = rawData.split("\n");
    const valueStrings = contentLines[1].split(" ");
    const elementCount = Number(contentLines[0]);

    const resultAccumulator = valueStrings.slice(0, elementCount).reduce((currentStatus, currentItemString) => {
        let { minimumSeen, qualifyingCount } = currentStatus;

        if (currentItemString <= minimumSeen) {
            qualifyingCount++;
        }
        
        if (minimumSeen >= currentItemString) {
            minimumSeen = currentItemString;
        }

        return { minimumSeen, qualifyingCount };
    }, { qualifyingCount: 0, minimumSeen: Number.MAX_SAFE_INTEGER });

    console.log(resultAccumulator.qualifyingCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
