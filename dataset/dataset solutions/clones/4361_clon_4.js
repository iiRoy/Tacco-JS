"use strict";

const evaluateContent = (entireInputPayload) => {
    const stringRepresentation = String(entireInputPayload);
    const newlinePosition = stringRepresentation.indexOf('\n');

    let relevantSection;
    if (newlinePosition !== -1) {
        relevantSection = stringRepresentation.substring(0, newlinePosition);
    } else {
        relevantSection = stringRepresentation;
    }

    const targetPattern = new RegExp("9");

    if (targetPattern.test(relevantSection)) {
        process.stdout.write("Yes\n");
    } else {
        process.stdout.write("No\n");
    }
};

let accumulatedData = '';

process.stdin.setEncoding('utf8');
process.stdin.resume();

process.stdin.on('data', (piece) => {
    accumulatedData += piece;
});

process.stdin.on('end', () => {
    evaluateContent(accumulatedData);
});