function processInput(rawData) {
    const trimmedData = rawData.trim();
    const charSegments = trimmedData.split('');
    const digitArray = charSegments.map(charVal => parseInt(charVal, 10));

    let nineCount = 0;
    for (const currentDigit of digitArray) {
        if (currentDigit === 9) {
            nineCount++;
        }
    }

    const resultStatus = (nineCount > 0) ? 'Yes' : 'No';
    console.log(resultStatus);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
