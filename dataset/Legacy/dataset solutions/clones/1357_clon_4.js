function processInput(rawText) {
    const numericValues = rawText.split(" ").map(Number);
    const firstVal = numericValues[0];
    const secondVal = numericValues[1];

    const comparisonIndex = Math.sign(firstVal - secondVal);

    const messageMap = {
        '-1': "a < b",
        '0': "a == b",
        '1': "a > b"
    };

    console.log(messageMap[comparisonIndex]);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
