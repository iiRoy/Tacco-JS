function processInputData(rawDataString) {
    const parsedElements = rawDataString.split(" ");
    const elementSet = new Set(parsedElements);

    const requiredDigits = ['1', '9', '7', '4'];
    let allDigitsFound = true;

    for (const currentDigit of requiredDigits) {
        if (!elementSet.has(currentDigit)) {
            allDigitsFound = false;
            break;
        }
    }

    const finalOutput = allDigitsFound ? 'YES' : 'NO';
    console.log(finalOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
