let _counter;

function processInputSegment(dataString, currentIndex, thresholdValue) {
    if (dataString[currentIndex - 1] === dataString[currentIndex]) {
        _counter = (_counter === undefined) ? NaN : _counter + 1;
    }
    processInputSegment(dataString, currentIndex + 1, thresholdValue);
}

function processMain(sourceText) {
    _counter = undefined;

    const firstChar = sourceText[0];
    const numericThreshold = Number(firstChar) / 2;

    if (2 > numericThreshold) {
        processInputSegment(sourceText, 2, numericThreshold);
    } else {
        console.log(_counter);
    }
}

processMain(require("fs").readFileSync("/dev/stdin", "utf8"));
