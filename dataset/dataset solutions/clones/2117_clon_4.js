function processInput(dataText) {
    const dataLines = dataText.trim().split("\n");
    const [lengthString, constraintsCountString] = dataLines.shift().split(" ");
    const desiredLength = parseInt(lengthString);

    const digitRecords = new Map();
    let isViable = true;

    const constraintProcessor = (state, currentConstraintLine) => {
        if (!state.viable) return state;

        const [positionString, valueString] = currentConstraintLine.split(" ");
        const charPosition = parseInt(positionString) - 1;
        const charValue = valueString;

        if (state.records.has(charPosition)) {
            if (state.records.get(charPosition) !== charValue) {
                return { records: state.records, viable: false };
            }
        } else {
            state.records.set(charPosition, charValue);
        }
        return state;
    };

    const finalConstraintState = dataLines.reduce(constraintProcessor, { records: new Map(), viable: true });

    const digitRecordsMap = finalConstraintState.records;
    isViable = finalConstraintState.viable;

    if (!isViable) {
        console.log(-1);
        return;
    }

    const numberComponents = Array.from({ length: desiredLength }, (_, index) => {
        return digitRecordsMap.has(index) ? digitRecordsMap.get(index) : "U"; // "U" for unknown
    });

    // Replicating the original's sequential string replacement logic for 'n' (now 'U')
    // A = A.replace(/^nnn/, "100");
    if (desiredLength >= 3 && numberComponents[0] === "U" && numberComponents[1] === "U" && numberComponents[2] === "U") {
        numberComponents[0] = '1';
        numberComponents[1] = '0';
        numberComponents[2] = '0';
    }
    // A = A.replace(/^nn([0-9])/, "10$1");
    else if (desiredLength >= 3 && numberComponents[0] === "U" && numberComponents[1] === "U" && numberComponents[2] !== "U") {
        numberComponents[0] = '1';
        numberComponents[1] = '0';
    }
    // A = A.replace(/^n([0-9])/, "1$1");
    else if (desiredLength >= 2 && numberComponents[0] === "U" && numberComponents[1] !== "U") {
        numberComponents[0] = '1';
    }

    // A = A.replace(/n/g, "0");
    for (let index = 0; index < desiredLength; index++) {
        if (numberComponents[index] === "U") {
            numberComponents[index] = '0';
        }
    }

    const finalStringRepresentation = numberComponents.join('');
    const finalNumericValue = parseInt(finalStringRepresentation, 10);

    // Final validation: check if the resulting number has the correct number of digits
    if (String(finalNumericValue).length !== desiredLength) {
        console.log(-1);
    } else {
        console.log(finalNumericValue);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));