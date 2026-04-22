function processInput(textData) {
    const dataLines = textData.split('\n').slice(1);

    const equalityFlags = dataLines.map(lineEntry => {
        const numericComponents = lineEntry.split(' ');
        const firstElement = Number(numericComponents[0]);
        const secondElement = Number(numericComponents[1]);
        return firstElement === secondElement;
    });

    const consecutiveTripletFound = equalityFlags.some((value, index, fullArray) => {
        return value && fullArray[index + 1] && fullArray[index + 2];
    });

    const finalVerdict = consecutiveTripletFound ? "Yes" : "No";
    console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));