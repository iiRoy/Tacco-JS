function findSmallestAfterDiscard(linesCollection) {
    let workingLinesCopy = [...linesCollection];

    workingLinesCopy.shift();

    workingLinesCopy.sort();

    return workingLinesCopy[0];
}

function processInputData(rawInputContent) {
    const NEWLINE_SEPARATOR = "\n";
    let cleanedInputString = rawInputContent.trim();

    let allContentLines = cleanedInputString.split(NEWLINE_SEPARATOR);

    let finalResult = findSmallestAfterDiscard(allContentLines);

    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
