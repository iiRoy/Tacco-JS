function processInput(inputString) {
    const [totalElements, firstSegmentCount, baseNumber] = inputString.trim().split(" ").map(Number);

    const sequence = Array.from({ length: totalElements }, (_, currentIdx) => {
        if (currentIdx < firstSegmentCount) {
            return baseNumber;
        } else {
            return baseNumber === 1 ? 2 : baseNumber - 1;
        }
    });

    const outputLine = sequence.join(" ") + " ";

    console.log(outputLine);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
