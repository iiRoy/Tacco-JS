function processInputData(rawData) {
    const dataSegments = rawData.split('\n');
    const elementCount = Number(dataSegments[0]);
    const numericValues = dataSegments[1].split(' ').map(Number);

    const finalAccumulation = numericValues.reduce((state, currentVal) => {
        if (currentVal <= state.lowestEncountered) {
            return {
                tally: state.tally + 1,
                lowestEncountered: currentVal
            };
        }
        return state;
    }, { tally: 0, lowestEncountered: Number.MAX_SAFE_INTEGER });

    console.log(finalAccumulation.tally);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
