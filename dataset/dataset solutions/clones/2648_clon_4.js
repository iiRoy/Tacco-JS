function analyzeText(textData) {
    const trimmedData = textData.trim();

    if (trimmedData.length === 0) {
        console.log(0);
        return;
    }

    const finalState = Array.from(trimmedData).reduce((accumulator, character) => {
        const nextFragment = accumulator.workingFragment + character;

        if (nextFragment === accumulator.priorSegment) {
            return {
                ...accumulator,
                workingFragment: nextFragment
            };
        } else {
            return {
                priorSegment: nextFragment,
                workingFragment: "",
                occurrenceCount: accumulator.occurrenceCount + 1
            };
        }
    }, { priorSegment: "", workingFragment: "", occurrenceCount: 0 });

    console.log(finalState.occurrenceCount);
}

analyzeText(require("fs").readFileSync("/dev/stdin", "utf8"));