function ProcessInput(sourceData) {
    const dataLines = sourceData.split('\n');
    const [totalElements, windowLength] = dataLines[0].split(' ').map(Number);
    const valueSequence = dataLines[1].split(' ').map(Number);

    const aggregatedWindowValues = Array.from({ length: valueSequence.length - windowLength + 1 }, (_, index) =>
        valueSequence.slice(index, index + windowLength).reduce((accumulator, currentVal) => accumulator + currentVal, 0)
    );

    const peakWindowSum = Math.max(...aggregatedWindowValues);

    const finalComputedValue = (peakWindowSum + windowLength) / 2;

    console.log(finalComputedValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
